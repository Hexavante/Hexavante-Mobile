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

<p align="center">
  <a href="#português">🇧🇷 Português</a> · <a href="#english">🇺🇸 English</a> · <a href="docs/visão-geral.md">Docs</a>
</p>

---

<a id="português"></a>

## Português

### Índice

- [Sobre](#sobre)
- [Arquitetura](#arquitetura)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Setup](#setup)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Scripts](#scripts)
- [Sessão e API](#sessão-e-api)
- [Publicação](#publicação)
- [Solução de problemas](#solução-de-problemas)
- [Como contribuir](#como-contribuir)

### Sobre

App mobile em Expo (roteamento por arquivos com `expo-router`), com a mesma conta e os mesmos dados do app web.

### Arquitetura

```
Usuário ──▶ Telas (expo-router) ──▶ hooks/lib ──HTTPS──▶ api.hexavante.com.br
                                        │                      ▲
                                        └──── secure store ────┘ (token)
```

Desenvolvimento com Expo Go; builds nativos com EAS (APK/AAB/IPA).

### Estrutura de pastas

```
src/
├── app/           # Rotas (abas, pilhas, modais, layouts)
├── components/    # UI nativa reutilizável
├── lib/           # Cliente da API, sessão, helpers
├── hooks/         # Hooks (auth, queries...)
└── constants/     # Tema, cores, config
app.json           # Nome, slug, ícone, splash, scheme, permissões
assets/            # Ícones e splash
```

### Setup

```bash
npm install
npx expo start          # QR para o Expo Go
npm run android         # emulador/dispositivo Android
npm run ios             # simulador iOS (macOS)
```

### Variáveis de ambiente

| Variável | Para que |
|---|---|
| `API_URL` | Base da API (`https://api.hexavante.com.br`) |
| `APP_ENV` | `development` / `production` (logs e endpoints) |

Tokens ficam no secure store do aparelho, nunca em texto claro.

### Scripts

| Comando | Para que |
|---|---|
| `npm start` | Dev server do Expo |
| `npm run android` / `npm run ios` | Abrir no emulador/dispositivo |
| `npm run web` | Versão web do Expo |
| `npm run lint` | ESLint (`expo lint`) |

### Sessão e API

Mesma sessão da plataforma: login e-mail/senha e OAuth (navegador do sistema + deep-link de retorno). Mesmos contratos (`/api/v1/*`, `{ data, pagination }`); 401 leva ao login; erros em pt-BR amigável.

### Publicação

Perfis EAS: `development`, `preview` (APK), `production` (AAB + IPA). Versionar `app.json` (`versionCode`/`buildNumber`) por release + changelog curto em português.

### Solução de problemas

| Sintoma | Causa provável | Ação |
|---|---|---|
| QR não conecta | Celular e PC em redes diferentes | Mesma rede Wi-Fi + túnel (`--tunnel`) |
| 401 em tudo | Sessão expirada | Logout + login (limpa secure store) |
| Tela branca | Erro de JS | Balançar o aparelho (menu dev) → erro |
| Build EAS falha | Versão/credencial | Conferir `app.json` + credenciais da loja |

### Como contribuir

1. Branch de `master`, commits curtos em português.
2. `lint` verde; testar em aparelho real (fonte grande, modo escuro do SO).
3. Nunca commitar segredos, keystores ou `dist/`.

### Documentação técnica (`docs/`)

`visão-geral`, `requisitos-funcionais`, `regras-de-negocio`, `casos-de-uso`, `der-conceitual`, `der-logico`, `glossario`, `stack`, `permissoes`, `instalacao-e-desenvolvimento`, `deploy-producao`, `escopo-mvp`.

---

<a id="english"></a>

## English (summary)

Hexavante mobile app (Expo, React Native, expo-router). Same API and account as web/desktop. Run with `npx expo start` (Expo Go for dev). See `docs/` (in Portuguese) for full technical documentation.
