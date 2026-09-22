<p align="center">
  <img src="assets/images/hexavante-logo.png" width="120" alt="Hexavante" />
</p>

<h1 align="center">Hexavante Mobile</h1>

<p align="center">
  <strong>Aplicativo da plataforma educacional Hexavante para Android e iOS.</strong><br/>
  <em>Cursos, simulados, tutoriais, gamificação, loja e temas — a mesma conta do app web.</em>
</p>

<p align="center">
  <a href="https://github.com/Hexavante/Hexavante-Mobile/releases/tag/v1.0.0-debug">
    <img src="https://img.shields.io/badge/⬇_Baixar_APK-v1.0.0-22d3ee?style=for-the-badge&labelColor=0f172a" alt="Baixar APK" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Expo-00001f?logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/React_Native-61DAFB?logo=react&logoColor=black" alt="React Native" />
  <img src="https://img.shields.io/badge/expo_router-00001f?logo=expo&logoColor=white" alt="expo-router" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Android-3DDC84?logo=android&logoColor=white" alt="Android" />
</p>

<p align="center">
  <a href="#-download">📥 Download</a> ·
  <a href="#-funcionalidades">✨ Funcionalidades</a> ·
  <a href="#-setup">🛠 Setup</a> ·
  <a href="#-publicação">🚀 Publicação</a> ·
  <a href="#-english">🇺🇸 English</a>
</p>

---

## 📥 Download

> [!NOTE]
> Build de **desenvolvimento** para testes. O APK final da Play Store será publicado aqui quando pronto.

| Versão | Tipo | Download |
|---|---|---|
| **v1.0.0-debug** | APK (Android 8+) | [⬇ hexavante-v1.0.0-debug.apk](https://github.com/Hexavante/Hexavante-Mobile/releases/download/v1.0.0-debug/hexavante-v1.0.0-debug.apk) |

**Instalação:**
1. Baixe o APK no celular
2. Permita *"instalar apps desconhecidos"* quando o Android pedir
3. Abra o app e entre com a conta abaixo

**Conta de teste:**

| E-mail | Senha |
|---|---|
| `teste@hexavante.com` | `Teste123!` |

---

## ✨ Funcionalidades

### 📚 Estudar
| | |
|---|---|
| 🎓 **Cursos** | Catálogo com busca, matrícula, player de aulas com vídeo, favoritar, anotações e conclusão |
| 📝 **Simulados** | Busca, timer com envio automático, correção com nota e gabarito de resultado |
| 🎬 **Tutoriais** | Lista da comunidade com busca, player de vídeo e contador de views |
| 📊 **Estatísticas** | Média, melhor nota, desempenho por matéria e evolução recente |
| 🕘 **Histórico** | Todas as tentativas de simulados com paginação |

### 🎮 Gamificação
| | |
|---|---|
| ⚡ **XP e níveis** | Barra de progresso, ligas (Bronze/Prata/Ouro) e meta diária de 50 XP |
| 🔥 **Streak** | Dias seguidos de estudo na home |
| 🏆 **Conquistas** | Grade de medals desbloqueadas e bloqueadas |
| 🪙 **Moedas** | Ganhe por acertos, gaste na loja, veja o histórico |
| 🏅 **Ranking** | Leaderboard geral + sua posição |

### 🛍 Loja e perfil
| | |
|---|---|
| 👑 **Premium** | Trial de 30 dias com benefícios (simulados exclusivos, x2 moedas) |
| 🎨 **Temas** | 13 temas equipáveis (Cyberpunk, Hacker, Sakura, claros e escuros) — mudam o app inteiro, incluindo a barra inferior |
| 🖼 **Cosméticos** | Títulos, bordas de avatar e itens por categoria, com inventário |
| ✅ **Certificados** | Meus certificados + verificação pública por código HXV |
| 🔔 **Notificações** | Central com deep-link e push (build de produção) |

### 🔐 Conta
Login e-mail/senha, verificação de dispositivo novo por código, recuperação de senha, cadastro com validação e sessão persistente (secure store).

---

## 🛠 Setup

```bash
npm install
npx expo start          # QR para o Expo Go
npm run android         # emulador/dispositivo Android
npm run ios             # simulador iOS (macOS)
```

### Arquitetura

```
Usuário ──▶ Telas (expo-router) ──▶ hooks/lib ──HTTPS──▶ api.hexavante.com.br
                                         │                      ▲
                                         └─── cookie + secure store (sessão)
```

Desenvolvimento com Expo Go; builds nativos locais (Gradle) ou EAS (APK/AAB/IPA).

### Estrutura de pastas

```
src/
├── app/              # Rotas: (tabs), (auth), curso, aula, exame, tutorial, loja...
├── components/       # UI reutilizável (ui/, auth/, gamification/)
├── lib/              # API, sessão, temas, notificações, haptics
├── hooks/            # useToken, use-theme...
└── constants/        # Paletas (13 temas), espaçamentos, raios
app.config.js        # Nome, pacote, ícones, splash, plugins, env
eas.json             # Perfis development / preview / production
assets/images/       # Ícones, splash e logo
```

### Variáveis de ambiente

| Variável | Para que | Padrão |
|---|---|---|
| `API_URL` | Base da API | `https://api.hexavante.com.br` |
| `APP_URL` | Links externos | `https://hexavante.com.br` |
| `EAS_PROJECT_ID` | Push notifications | — |

### Scripts

| Comando | Para que |
|---|---|
| `npm start` | Dev server do Expo |
| `npm run android` / `npm run ios` | Abrir no emulador/dispositivo |
| `npm run web` | Versão web do Expo |
| `npm run lint` | ESLint (`expo lint`) |

### Sessão e API

Mesma sessão da plataforma via cookie `__Secure-hexavante.session_token`. Contratos `/api/v1/*`; 401 leva ao login; erros em pt-BR amigável.

---

## 🚀 Publicação

| Perfil EAS | Artefato |
|---|---|
| `development` | Dev client (interno) |
| `preview` | APK (interno) |
| `production` | **AAB** (Play Store) + IPA |

```bash
npx eas-cli login
npx eas-cli build --platform android --profile production
```

APKs manuais vão em [Releases](../../releases). Versionar `version`/`versionCode` por release + changelog curto em português.

---

## 🆘 Solução de problemas

| Sintoma | Causa provável | Ação |
|---|---|---|
| QR/URL não conecta | Celular e PC em redes diferentes | USB + `adb reverse tcp:8081 tcp:8081` |
| 401 em tudo | Sessão expirada | Logout + login (limpa secure store) |
| Tela branca | Erro de JS | Balançar o aparelho (menu dev) → erro |
| "Route not found" no login | Bundle antigo no Expo Go | Fechar o app por completo e reabrir a URL |
| Build EAS falha | Versão/credencial | Conferir `app.config.js` + credenciais |

---

## 🤝 Como contribuir

1. Branch de `master`, commits curtos em português.
2. `npx tsc --noEmit` verde; testar em aparelho real.
3. Nunca commitar segredos, keystores ou `dist/`.

### Documentação técnica (`docs/`)

`visão-geral`, `requisitos-funcionais`, `regras-de-negocio`, `casos-de-uso`, `der-conceitual`, `der-logico`, `glossario`, `stack`, `permissoes`, `instalacao-e-desenvolvimento`, `deploy-producao`, `escopo-mvp`.

---

## 🇺🇸 English (summary)

Hexavante mobile app (Expo, React Native, expo-router). Same API and account as web. **Download the test APK** in [Releases](../../releases) (`teste@hexavante.com` / `Teste123!`). Run with `npx expo start` (Expo Go for dev). See `docs/` (in Portuguese) for full technical documentation.
