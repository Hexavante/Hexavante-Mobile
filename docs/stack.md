# Stack técnica — Hexavante Mobile

Documento de referência da arquitetura **implementada** no repositório.

---

## Visão geral

| Camada | Tecnologia | Versão (referência) |
|--------|------------|---------------------|
| Framework | Expo + React Native | SDK atual (`expo`) |
| Navegação | expo-router | Rotas por arquivos |
| Linguagem | TypeScript | strict |
| Build | EAS Build | `development`/`preview`/`production` |
| Dados | API Hexavante (`/api/v1/*`) | Mesmos contratos do web |

---

## Arquitetura em camadas

```
┌─────────────────────────────────────────┐
│  Telas (expo-router: abas, pilhas)      │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│  hooks + lib (sessão, cliente API)      │
└──────────────────┬──────────────────────┘
                   │ HTTPS
┌──────────────────▼──────────────────────┐
│        api.hexavante.com.br             │
└─────────────────────────────────────────┘
```

### Responsabilidades por pasta

| Pasta | Responsabilidade |
|-------|------------------|
| `src/app/` | Rotas (abas, pilhas, modais, layouts) |
| `src/components/` | UI nativa reutilizável |
| `src/lib/` | Cliente da API, sessão, helpers |
| `src/hooks/` | Hooks (auth, queries...) |
| `src/constants/` | Tema, cores, config |
