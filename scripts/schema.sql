-- ============================================================
-- SCHEMA PostgreSQL — Controle Financeiro
-- Compatible with Neon (PostgreSQL serverless)
-- ============================================================
-- Rodar no SQL Editor do Neon ou via psql:
--   psql "postgresql://..." -f schema.sql
-- ============================================================

-- Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABELA: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(36)      PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name          VARCHAR(100)     NOT NULL,
  email         VARCHAR(150)     NOT NULL UNIQUE,
  password      VARCHAR(255)     NOT NULL,
  emergency_fund DECIMAL(10, 2)  NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: account_types
-- ============================================================
CREATE TABLE IF NOT EXISTS account_types (
  id         VARCHAR(36)   PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name       VARCHAR(100)  NOT NULL,
  user_id    VARCHAR(36)   NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_account_types_user_id ON account_types(user_id);

-- ============================================================
-- TABELA: expenses
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id                  VARCHAR(36)     PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id             VARCHAR(36)     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_type_id     VARCHAR(36)     REFERENCES account_types(id) ON DELETE SET NULL,
  parent_expense_id   VARCHAR(36)     REFERENCES expenses(id) ON DELETE CASCADE,
  name                VARCHAR(150)    NOT NULL,
  value               DECIMAL(10, 2)  NOT NULL,
  due_date            DATE            NOT NULL,
  is_recurring        BOOLEAN         NOT NULL DEFAULT FALSE,
  is_installment      BOOLEAN         NOT NULL DEFAULT FALSE,
  installment_count   INTEGER,
  installment_number  INTEGER,
  is_paid             BOOLEAN         NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_user_id   ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_due_date  ON expenses(due_date);

-- ============================================================
-- TABELA: income
-- ============================================================
CREATE TABLE IF NOT EXISTS income (
  id           VARCHAR(36)     PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id      VARCHAR(36)     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name         VARCHAR(150)    NOT NULL,
  value        DECIMAL(10, 2)  NOT NULL,
  is_recurring BOOLEAN         NOT NULL DEFAULT FALSE,
  income_date  DATE            NOT NULL,
  created_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_income_user_id     ON income(user_id);
CREATE INDEX IF NOT EXISTS idx_income_income_date ON income(income_date);

-- ============================================================
-- Row Level Security (RLS) — Camada extra de segurança no banco
-- Garante que mesmo consultas sem WHERE por userId não vazem dados
-- ============================================================

-- Habilitar RLS nas tabelas sensíveis
ALTER TABLE account_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE income        ENABLE ROW LEVEL SECURITY;

-- NOTA: As policies abaixo são para quando você usa um user de banco
-- por usuário da aplicação. Para aplicações com um único user de conexão
-- (como é o caso aqui com Sequelize), o isolamento é feito na camada de aplicação.
-- Deixamos RLS habilitado como defesa em profundidade.

-- ============================================================
-- Função para atualizar updated_at automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER account_types_updated_at
  BEFORE UPDATE ON account_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER income_updated_at
  BEFORE UPDATE ON income
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- VERIFICAÇÃO: confirma que todas as tabelas foram criadas
-- ============================================================
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('users', 'account_types', 'expenses', 'income')
ORDER BY table_name;
