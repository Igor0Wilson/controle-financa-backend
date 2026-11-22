# WSS Sistemas e Soluções — Segurança, Criptografia AES-256-GCM e Conformidade LGPD

Este documento descreve a arquitetura de proteção de dados implantada no **Painel Monet (Finanças)**, procedimentos de backup/recuperação de chaves, rotação segura sem Cloud KMS e configurações manuais exigidas na Vercel e Firebase.

---

## 1. Algoritmo Criptográfico e Formato em Repouso

- **Algoritmo obrigatório:** `AES-256-GCM` autenticado (`AEAD`).
- **Nonce / IV:** 96 bits (`12 bytes`) gerados aleatoriamente via `crypto.randomBytes(12)` a cada operação de criptografia (sempre único; nunca reutilizado para o mesmo plaintext).
- **Tag de Autenticação GCM:** 128 bits (`16 bytes`), validada obrigatoriamente na descriptografia (`decipher.setAuthTag(authTag)`). Qualquer adulteração bloqueia a descriptografia (*fail-closed*).
- **AAD (Additional Authenticated Data):** Todo campo protegido é vinculado criptograficamente ao contexto do registro e proprietário:
  ```text
  pm:v2|c=<collectionName>|f=<fieldName>|id=<recordId>|own=<ownerId>
  ```
  Se um ciphertext for copiado de um usuário ou documento para outro no Firestore, a validação AAD falha imediatamente e impede a descriptografia.
- **Formato armazenado:**
  ```text
  enc:v2:<keyVersion>:<ivHex_24>:<authTagHex_32>:<ciphertextHex>
  ```
- **Serviço centralizado:** [`CryptoService`](../backend/src/common/crypto.service.ts) e utilitário [`data-crypto.utils.ts`](../backend/src/common/data-crypto.utils.ts) executam 100% no backend NestJS. React/WebView nunca recebem nem manipulam chaves.

---

## 2. Classificação de Dados (Criptografados vs. Técnicos)

| Coleção | Campos Criptografados (AES-256-GCM + AAD) | Campos Índices Cegos (HMAC-SHA256) | Campos Técnicos Não Criptografados e Motivo |
| :--- | :--- | :--- | :--- |
| `users` | `name`, `email`, `cpf`, `phone`, `emergencyFund`, `externalEmergencyFund`, `investments`, `externalInvestments`, `foodAllowance` | `emailIndex`, `cpfIndex` | `id`, `firebaseUid`, `authProvider`, `isActive`, `tokenVersion`, `deactivatedAt`, `deactivatedAtMs`, `foodAllowanceDate`, `foodAllowanceRecurring`, `encryptionKeyVersion`, `createdAt`, `updatedAt` (roteamento, lifecycle, revogação JWT e índices sem PII) |
| `account_types` | `name` | — | `id`, `userId`, `encryptionKeyVersion`, `createdAt`, `updatedAt` (filtro por proprietário) |
| `expenses` | `name`, `value` | — | `id`, `userId`, `accountTypeId`, `dueDate`, `isRecurring`, `isInstallment`, `installmentCount`, `installmentNumber`, `parentExpenseId`, `isPaid`, `isCreditCard`, `paymentMethod`, `encryptionKeyVersion`, `createdAt`, `updatedAt` (filtros por período, status e parcelas) |
| `income` | `name`, `value` | — | `id`, `userId`, `isRecurring`, `incomeDate`, `encryptionKeyVersion`, `createdAt`, `updatedAt` (cálculo cronológico de receitas) |
| `investments` | `name`, `category`, `notes`, `amount` | — | `id`, `userId`, `investedDate`, `source`, `encryptionKeyVersion`, `createdAt`, `updatedAt` (ordenação temporal e cálculo patrimônio vs carteira externa) |
| `family_members` | `userCpf` | — | `id`, `familyGroupId`, `userId`, `role`, `privacyConfig`, `encryptionKeyVersion`, `createdAt`, `updatedAt` (autorização e regras booleanas por ID opaco) |
| `family_invites` | `inviterCpf`, `inviteeCpf` | — | `id`, `familyGroupId`, `inviterUserId`, `inviteeUserId`, `status`, `encryptionKeyVersion`, `createdAt`, `updatedAt` |
| `email_locks` / `cpf_locks` | Document ID em HMAC-SHA256 | ID derivado por `BLIND_INDEX_KEY`/HKDF | `userId`, `updatedAt` (unicidade atômica sem expor hash SHA-256 nu de CPF) |
| `audit_logs` | Nenhum dado pessoal em claro (IP anonimizado via `ipHash`) | `ipHash` (HMAC truncado) | `id`, `actorUserId`, `action`, `resource`, `resourceId`, `outcome`, `statusCode`, `path`, `createdAt`, `expiresAtMs` (trilha de auditoria imutável sem PII) |
| `rate_limits` | — | ID SHA-256 da janela | `totalHits`, `expiresAtMs`, `blockedUntilMs`, `updatedAtMs` (throttling distribuído serverless) |

---

## 3. Gerenciamento, Backup e Recuperação de Chaves (Sem Cloud KMS)

1. **Geração segura pelo responsável (nunca pelo código):**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Use chaves distintas para **Desenvolvimento**, **Homologação** e **Produção**.
2. **Variáveis privadas obrigatórias na Vercel (Backend):**
   - `DATA_ENCRYPTION_KEY`: chave de 256 bits (64 hex ou 32 bytes Base64).
   - `DATA_ENCRYPTION_KEY_VERSION`: identificador da versão atual (padrão `k1`).
   - `DATA_ENCRYPTION_KEY_PREVIOUS` *(opcional na rotação)*: ex.: `k1:<hex64>`.
   - `BLIND_INDEX_KEY` *(recomendada em produção)*: chave HMAC de 256 bits separada para `emailIndex`, `cpfIndex` e locks (`email_locks`/`cpf_locks`). Se omitida, deriva determinísticamente da `DATA_ENCRYPTION_KEY` via **HKDF-SHA256**.
   - `JWT_SECRET`: segredo forte (>= 32 caracteres aleatórios).
3. **Validação *Fail-Closed* no startup:** Se `DATA_ENCRYPTION_KEY` ou `JWT_SECRET` estiver ausente, com placeholder ou tamanho inválido, o servidor NestJS aborta a inicialização imediatamente sem chave padrão.
4. **Backup seguro:**
   - Armazene a cópia cifrada/offline da `DATA_ENCRYPTION_KEY` e `BLIND_INDEX_KEY` em **cofre de senhas corporativo com MFA** (ex.: 1Password/Bitwarden Enterprise) ou mídia offline protegida, **fora do Git, fora do Firestore e fora de logs**.
   - **Procedimento de recuperação:** Caso um deploy ou projeto Vercel perca a variável, restaure exatamente a mesma dupla `(DATA_ENCRYPTION_KEY, DATA_ENCRYPTION_KEY_VERSION)` do cofre para o painel Environment Variables da Vercel e faça **Redeploy**. Não sobrescreva a chave em produção sem ter os registros migrados.

---

## 4. Procedimento Seguro de Rotação de Chave

Nunca substitua `DATA_ENCRYPTION_KEY` diretamente enquanto houver dados cifrados pela versão anterior. Siga exatamente estas etapas:

1. Gere uma nova chave 256 bits (`<NOVA_CHAVE>`) e defina a nova versão (ex.: `k2`). Caso ainda não utilize `BLIND_INDEX_KEY` separada, configure `BLIND_INDEX_KEY` ou mantenha compatibilidade antes da rotação.
2. Execute primeiro o script em modo leitura com a configuração atual para validar integridade:
   ```bash
   npx ts-node -r tsconfig-paths/register tools/migrate-encryption-v2.ts --dry-run
   ```
3. Atualize as variáveis de ambiente privadas para manter a versão antiga acessível para leitura:
   - `DATA_ENCRYPTION_KEY_PREVIOUS=k1:<CHAVE_ANTIGA_HEX>`
   - `DATA_ENCRYPTION_KEY=<NOVA_CHAVE_HEX>`
   - `DATA_ENCRYPTION_KEY_VERSION=k2`
4. Faça o deploy da aplicação com ambas as versões ativas (novas gravações já usam `k2`, leituras antigas continuam funcionando com `k1`).
5. Execute a migração em lote com backup prévio obrigatório fora do Firestore:
   ```bash
   npx ts-node -r tsconfig-paths/register tools/migrate-encryption-v2.ts --apply --backup-out=./backups/pre-rotacao-k2.json
   ```

---

## 6. Alternância de Ambiente Produção vs. Desenvolvimento (`painel-monet` vs `painel-monet-dev`)

- **Backend:** defina `FIREBASE_ENV=development` (ou `production`) em `backend/.env` ou na Vercel Preview/Dev.
  - Em `development`, o backend bloqueia automaticamente qualquer tentativa de inicializar com credenciais de `painel-monet` (produção) e exige `FIREBASE_DEV_SERVICE_ACCOUNT_PATH` / `JSON` / variáveis `FIREBASE_DEV_*` do projeto `painel-monet-dev`.
  - É possível usar chave AES-256 exclusiva de desenvolvimento via `DATA_ENCRYPTION_KEY_DEV`.
- **Frontend:** defina `REACT_APP_FIREBASE_ENV=development` (ou `production`) em `frontend/.env` ou na Vercel Preview/Dev para apontar o Firebase Web SDK para `painel-monet-dev` sem editar código.
6. Rode `--dry-run` novamente e confirme `total a migrar=0`.
7. Após validação completa e janela de estabilização, guarde o backup com segurança (ou destrua conforme política de retenção) e remova a chave antiga de `DATA_ENCRYPTION_KEY_PREVIOUS` quando não existir nenhum registro `k1`.

---

## 5. Checklist Manual na Vercel & Firebase

1. **Vercel Backend:**
   - Cadastrar `DATA_ENCRYPTION_KEY`, `DATA_ENCRYPTION_KEY_VERSION=k1`, `BLIND_INDEX_KEY` (opcional recomendada), `JWT_SECRET` (mínimo 32 caracteres aleatórios) e `FRONTEND_URL` (domínio exato de produção).
2. **Firebase Firestore:**
   - Publicar o arquivo atualizado [`backend/firestore.rules`](../backend/firestore.rules) no Firebase Console (`firebase deploy --only firestore:rules`), garantindo bloqueio total ao acesso cliente direto (`allow read, write: if false;`).
   - Revisar **IAM** da Service Account do backend para princípio do menor privilégio (**Cloud Datastore User** + **Firebase Auth Admin** apenas no projeto `painel-monet`), rotacionando a chave privada JSON periodicamente.
   - Habilitar **PITR (Point-in-Time Recovery)** / Backups agendados no Cloud Firestore para recuperação ante falhas operacionais.
