# Deploy em produção — Hexavante Mobile

Documento de referência da distribuição **implementada**.

---

## Canais (EAS)

| Perfil | Uso |
|--------|-----|
| `development` | Dev client (Expo Go customizado) |
| `preview` | APK para testes internos |
| `production` | AAB (Play) + IPA (App Store) |

## Passo a passo

```bash
npx expo start --android   # ou --ios: smoke test completo
npm run lint
```

1. Versionar `app.json` (`versionCode`/`buildNumber` incrementais).
2. Build `production` no EAS.
3. Google Play (AAB) + App Store (IPA) via EAS Submit ou upload manual.
4. Changelog curto em português.

## Verificação

Instalação limpa: login, catálogo, aula, simulado, offline/online, logout. Monitorar crashes e avaliações pós-release.
