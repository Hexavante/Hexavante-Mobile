# Sprint 2 — Navegação (Mobile)

## `expo-router` (`src/app/`)

Abas principais (estudar, simulados, perfil...) + pilhas de detalhe (curso, aula, resultado) + modais (filtros, confirmações). Deep links via `scheme` do `app.json` (ex.: login OAuth de volta ao app).

## Padrões

- Um arquivo = uma rota; layouts por pasta (`_layout.tsx`).
- Parâmetros tipados (`useLocalSearchParams`), fallback para slug inválido.
- Voltar do Android respeita a pilha; gesto de swipe onde fizer sentido.
- Loading (`Suspense`/skeleton) e telas de erro por rota.
