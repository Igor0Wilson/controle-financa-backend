# Painel Monet — Aplicativo Mobile (React Native + WebView)

Aplicativo mobile nativo para **Android** e **iPhone (iOS)** construído com **React Native (Expo)** e `react-native-webview`, integrado ao **Frontend na Vercel** (`https://painel-monet-front.vercel.app`), **Backend na Vercel** (`https://painel-monet-uei6.vercel.app`) e **Firebase (Cloud Firestore + Authentication)**.

## 1. Testar imediatamente no iPhone ou Android (Expo Go)

```powershell
cd mobile
npm install
npx expo start
```

Escaneie o QR Code no terminal usando o app **Expo Go** (Android) ou a **Câmera do iPhone**.

## 2. Gerar instalador `.apk` para Android (na nuvem via EAS Build)

```powershell
cd mobile
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

Ao concluir, a Expo exibe o link e QR Code para baixar o arquivo **`.apk`** e instalar diretamente em qualquer celular Android.

## 3. Gerar instalador para iPhone / iOS (`.ipa` na nuvem via EAS Build)

```powershell
cd mobile
eas build --platform ios --profile production
```

*(Para gerar `.ipa` instalável em iPhones físicos fora da App Store ou publicar na App Store, a Apple exige uma conta Apple Developer ativa).*

## 4. Instalação instantânea sem loja (PWA direto da Vercel — iPhone e Android)

O frontend em `https://painel-monet-front.vercel.app` também possui **PWA completo com Service Worker e Safe Area iOS**:
- **No iPhone (Safari):** abra `https://painel-monet-front.vercel.app` → toque em **Compartilhar** → **Adicionar à Tela de Início**.
- **No Android (Chrome):** abra `https://painel-monet-front.vercel.app` → toque no menu `⋮` → **Instalar aplicativo**.
