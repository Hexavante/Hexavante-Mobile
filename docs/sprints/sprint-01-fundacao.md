# Sprint 1 — Fundação (Mobile)

## Stack

Expo + React Native + `expo-router` (roteamento por arquivos) + TypeScript. Desenvolvimento com Expo Go; builds nativos com EAS.

## Estrutura (`src/`)

```
app/           # Rotas (abas, pilhas, modais, layouts)
components/    # UI nativa reutilizável
lib/           # Cliente da API, sessão, helpers
hooks/         # Hooks (auth, queries...)
constants/     # Tema, cores, config
```

`app.json` (nome, slug, ícone, splash, scheme, permissões), `assets/` (ícones/splash).

## Setup

```bash
npm install
npx expo start        # QR para o Expo Go
npm run android       # emulador/dispositivo Android
npm run ios           # simulador iOS (macOS)
```

## Scripts

`start`, `android`, `ios`, `web` (Expo web), `lint` (`expo lint`).
