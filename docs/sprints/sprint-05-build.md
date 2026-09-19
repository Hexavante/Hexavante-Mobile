# Sprint 5 — Build e Publicação (Mobile)

## Desenvolvimento e QA

```bash
npx expo start --android   # ou --ios
npm run lint
```

Testar em aparelho real (Expo Go): login, catálogo, aula, simulado, offline/online, logout. Checar tamanhos de fonte grande e modo escuro do SO.

## Build (EAS)

Perfis `development` (Expo Go custom), `preview` (APK para testes) e `production` (AAB/APK + IPA). Versionar `app.json` (`versionCode`/`buildNumber` incrementais) a cada release.

## Publicação

1. Changelog curto em português.
2. Google Play (AAB) + App Store (IPA) via EAS Submit ou upload manual.
3. Pós-release: monitorar crashes e avaliações; hotfix só pelo mesmo pipeline (nada de APK "na mão" sem tag).
