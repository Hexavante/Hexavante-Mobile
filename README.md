<p align="center">
  <img src="https://img.shields.io/badge/HEXAVANTE-Mobile-0ea5e9?style=for-the-badge&labelColor=0f172a" alt="Hexavante Mobile" />
</p>

<p align="center">
  <strong>Aplicativo mobile da plataforma Hexavante (Android/iOS).</strong><br/>
  <em>Mobile client: Expo + React Native + expo-router.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Expo-00001f?logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/React_Native-61DAFB?logo=react&logoColor=black" alt="React Native" />
  <img src="https://img.shields.io/badge/expo_router-00001f?logo=expo&logoColor=white" alt="expo-router" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
</p>

---

## Português

App mobile em Expo (roteamento por arquivos com `expo-router`), consumindo a mesma API (`https://api.hexavante.com.br`) e a mesma conta do web/desktop.

### Estrutura

```
src/
├── app/           # Rotas (expo-router: abas, telas, layouts)
├── components/    # Componentes nativos reutilizáveis
├── lib/           # Cliente da API, sessão, helpers
├── hooks/         # Hooks (auth, queries...)
└── constants/     # Tema, cores, config
app.json           # Nome, ícone, splash, scheme, permissões
```

### Setup

```bash
npm install
npx expo start          # menu: Android (expo start --android), iOS, web
```

Pré-requisito: app **Expo Go** no celular (dev) ou build nativo para publicar.

### Scripts

| Comando | Para que |
|---|---|
| `npm start` | Dev server do Expo |
| `npm run android` / `npm run ios` | Abrir no emulador/dispositivo |
| `npm run web` | Versão web do Expo |
| `npm run lint` | ESLint (`expo lint`) |

### Sessão e API

Mesma sessão da plataforma: login com e-mail/senha ou OAuth, token guardado no secure store do aparelho, chamadas com o mesmo contrato da API (`/api/v1/*`).

### Documentação técnica

Guias por sprint em [`docs/sprints/`](docs/sprints/) (fundação → navegação → telas → build/publicação).

---

## English (summary)

Hexavante mobile app (Expo, React Native, expo-router). Same API and account as web/desktop. Run with `npx expo start` (Expo Go for dev). See `docs/sprints/` for technical guides (in Portuguese).
