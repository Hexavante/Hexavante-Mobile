<p align="center">
  <img src="https://img.shields.io/badge/HEXAVANTE-Mobile-0ea5e9?style=for-the-badge&labelColor=0f172a" alt="Hexavante Mobile" />
</p>

<p align="center">
  <strong>Aplicativo mobile da plataforma educacional Hexavante.</strong><br/>
  <em>Mobile client for the Hexavante educational platform.</em>
</p>

<p align="center">
  <a href="#português">🇧🇷 Português</a> · <a href="#english">🇺🇸 English</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Expo-57-000020?logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/React%20Native-0.86-61DAFB?logo=react&logoColor=black" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Platform-Android%20%7C%20iOS-green" alt="Platform" />
</p>

---

<a id="português"></a>

## Português

### Sobre

O **Hexavante Mobile** é o aplicativo mobile da plataforma educacional Hexavante, construído com Expo e React Native. Ele oferece a experiência completa de estudo — cursos, simulados, ranking, loja virtual e gamificação — em um app nativo para Android e iOS.

> **Status:** Em desenvolvimento ativo.

---

### Stack

| Categoria | Tecnologia |
|---|---|
| Framework | [React Native](https://reactnative.dev) 0.86 + [Expo](https://expo.dev) SDK 57 |
| Roteamento | [expo-router](https://docs.expo.dev/router/introduction) (file-based) |
| Linguagem | [TypeScript](https://www.typescriptlang.org) 6 |
| Animações | [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/) 4.5 |
| Gestos | [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/) 2.32 |
| Segurança | [expo-secure-store](https://docs.expo.dev/versions/latest/sdk/securestore/) (token storage) |
| Imagens | [expo-image](https://docs.expo.dev/versions/latest/sdk/image/) |
| Ícones | [lucide-react-native](https://lucide.dev) |
| UI | Dark mode nativo + componentes customizados |

---

### Funcionalidades

- **Autenticação** — Login/cadastro com email + senha, OAuth (Google, GitHub), sessão persistente
- **Dashboard** — Saudação personalizada, barra de XP, atalhos rápidos
- **Cursos** — Listagem, detalhes, módulos, aulas, progresso, matrícula
- **Simulados** — Listagem, detalhes, estatísticas, tentativas
- **Ranking** — Leaderboard global com posições e medalhas
- **Loja Virtual** — Itens cosméticos, economia de moedas, compra e inventário
- **Perfil** — Avatar, nome, email, XP, sair da conta
- **Gamificação** — XP, níveis, ligas, moedas virtuais

---

### Pré-requisitos

- **Node.js** compatível com Expo SDK 57
- **Expo CLI** (`npm install -g expo-cli`)
- Para Android: **Android Studio** com emulador
- Para iOS: **Xcode** com simulador (apenas macOS)
- Para teste direto: **Expo Go** instalado no dispositivo

---

### Instalação e Desenvolvimento

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npx expo start

# 3. Executar em plataforma específica
npm run android    # Emulador Android
npm run ios        # Simulador iOS
npm run web        # Navegador web
```

### Scripts Disponíveis

| Script | Descrição |
|---|---|
| `npx expo start` | Servidor de desenvolvimento |
| `npm run android` | Executar no Android |
| `npm run ios` | Executar no iOS |
| `npm run web` | Executar na web |
| `npm run lint` | Verificar código com ESLint |
| `npm run reset-project` | Resetar para template em branco |

---

### Estrutura do Projeto

```
Hexavante-Mobile/
├── app.json                     # Configuração Expo
├── src/
│   ├── app/                     # Rotas (Expo Router, file-based)
│   │   ├── _layout.tsx          # Layout raiz (AuthProvider, Stack)
│   │   ├── (auth)/              # Grupo de autenticação
│   │   │   ├── login.tsx        # Tela de login
│   │   │   └── register.tsx     # Tela de cadastro
│   │   ├── (tabs)/              # Navegação por abas
│   │   │   ├── index.tsx        # Dashboard (Inicio)
│   │   │   ├── cursos.tsx       # Cursos
│   │   │   ├── simulados.tsx    # Simulados
│   │   │   ├── loja.tsx         # Loja
│   │   │   └── perfil.tsx       # Perfil
│   │   ├── ranking.tsx          # Ranking
│   │   ├── curso/[id].tsx       # Detalhe do curso
│   │   └── exame/[id].tsx       # Detalhe do exame
│   ├── components/              # Componentes UI
│   │   ├── gamification/        # Barra de XP
│   │   └── ui/                  # Button, Card, Input, Screen, Loading, EmptyState
│   ├── constants/
│   │   └── theme.ts             # Cores, paleta, espacamento
│   ├── hooks/                   # Hooks (useTheme, useToken)
│   └── lib/
│       ├── api.ts               # Cliente API, auth, token storage
│       ├── auth-context.tsx     # AuthProvider (signIn/signUp/signOut)
│       ├── features.ts          # Módulos API (courses, exams, gamification, shop)
│       └── types.ts             # Tipos TypeScript
├── assets/                      # Ícones, splash screen, imagens
└── scripts/                     # Scripts utilitários
```

---

### Variáveis de Ambiente

O app conecta diretamente à API de produção. As configurações estão em `src/lib/api.ts`:

| Variável | Valor | Descrição |
|---|---|---|
| API URL | `https://api.hexavante.com.br` | URL base da API |
| Web URL | `https://hexavante.com.br` | URL da plataforma web |
| Token Key | `hexavante_access_token` | Chave do SecureStore |

---

### Conta de Demonstração

| Perfil | Email | Senha |
|---|---|---|
| Estudante | `aluno@hexavante.com` | `Aluno123!` |
| Instrutor | `instrutor@hexavante.com` | `Instrutor123!` |
| Admin | `admin@hexavante.com` | `Admin123!` |

---

### Licença

MIT License · Copyright 2024 Hexavante

---

<a id="english"></a>

## English

### About

**Hexavante Mobile** is the mobile client for the Hexavante educational platform, built with Expo and React Native. It delivers the full study experience — courses, practice exams, rankings, virtual shop, and gamification — as a native app for Android and iOS.

> **Status:** Actively in development.

---

### Stack

| Category | Technology |
|---|---|
| Framework | [React Native](https://reactnative.dev) 0.86 + [Expo](https://expo.dev) SDK 57 |
| Routing | [expo-router](https://docs.expo.dev/router/introduction) (file-based) |
| Language | [TypeScript](https://www.typescriptlang.org) 6 |
| Animations | [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/) 4.5 |
| Gestures | [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/) 2.32 |
| Security | [expo-secure-store](https://docs.expo.dev/versions/latest/sdk/securestore/) (token storage) |
| Images | [expo-image](https://docs.expo.dev/versions/latest/sdk/image/) |
| Icons | [lucide-react-native](https://lucide.dev) |
| UI | Native dark mode + custom components |

---

### Features

- **Authentication** — Email/password login, OAuth (Google, GitHub), persistent sessions
- **Dashboard** — Personalized greeting, XP bar, quick navigation
- **Courses** — Listing, details, modules, lessons, progress, enrollment
- **Practice Exams** — Listing, details, statistics, attempts
- **Ranking** — Global leaderboard with positions and medals
- **Virtual Shop** — Cosmetic items, coin economy, purchase and inventory
- **Profile** — Avatar, name, email, XP, sign out
- **Gamification** — XP, levels, leagues, virtual coins

---

### Prerequisites

- **Node.js** compatible with Expo SDK 57
- **Expo CLI** (`npm install -g expo-cli`)
- For Android: **Android Studio** with emulator
- For iOS: **Xcode** with simulator (macOS only)
- For direct testing: **Expo Go** installed on device

---

### Installation & Development

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npx expo start

# 3. Run on specific platform
npm run android    # Android emulator
npm run ios        # iOS simulator
npm run web        # Web browser
```

### Available Scripts

| Script | Description |
|---|---|
| `npx expo start` | Development server |
| `npm run android` | Run on Android |
| `npm run ios` | Run on iOS |
| `npm run web` | Run on web |
| `npm run lint` | Lint code with ESLint |
| `npm run reset-project` | Reset to blank template |

---

### Project Structure

```
Hexavante-Mobile/
├── app.json                     # Expo configuration
├── src/
│   ├── app/                     # Routes (Expo Router, file-based)
│   │   ├── _layout.tsx          # Root layout (AuthProvider, Stack)
│   │   ├── (auth)/              # Authentication group
│   │   │   ├── login.tsx        # Login screen
│   │   │   └── register.tsx     # Register screen
│   │   ├── (tabs)/              # Tab navigation
│   │   │   ├── index.tsx        # Dashboard (Home)
│   │   │   ├── cursos.tsx       # Courses
│   │   │   ├── simulados.tsx    # Practice Exams
│   │   │   ├── loja.tsx         # Shop
│   │   │   └── perfil.tsx       # Profile
│   │   ├── ranking.tsx          # Ranking
│   │   ├── curso/[id].tsx       # Course detail
│   │   └── exame/[id].tsx       # Exam detail
│   ├── components/              # UI components
│   │   ├── gamification/        # XP bar
│   │   └── ui/                  # Button, Card, Input, Screen, Loading, EmptyState
│   ├── constants/
│   │   └── theme.ts             # Colors, palette, spacing
│   ├── hooks/                   # Hooks (useTheme, useToken)
│   └── lib/
│       ├── api.ts               # API client, auth, token storage
│       ├── auth-context.tsx     # AuthProvider (signIn/signUp/signOut)
│       ├── features.ts          # API modules (courses, exams, gamification, shop)
│       └── types.ts             # TypeScript types
├── assets/                      # Icons, splash screen, images
└── scripts/                     # Utility scripts
```

---

### Environment Variables

The app connects directly to the production API. Configuration is in `src/lib/api.ts`:

| Variable | Value | Description |
|---|---|---|
| API URL | `https://api.hexavante.com.br` | Backend API base URL |
| Web URL | `https://hexavante.com.br` | Platform web URL |
| Token Key | `hexavante_access_token` | SecureStore key |

---

### License

MIT License · Copyright 2024 Hexavante
