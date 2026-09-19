# Sprint 4 — Sessão e API (Mobile)

## Sessão (`src/lib/`, `src/hooks/`)

Mesma conta do web: login e-mail/senha e OAuth (via navegador do sistema + deep-link de retorno). Token em armazenamento seguro (`expo-secure-store`); logout limpa tudo. Renovação/expiração tratadas no cliente HTTP central.

## Cliente da API

Base `https://api.hexavante.com.br`, mesmos contratos (`/api/v1/*`, `{ data, pagination }`). Regras: timeout + 1 retry com backoff, 401 → desloga para o login, erros exibidos em pt-BR amigável (nunca stack técnica).

## Offline

Cache das listas principais, fila de ações quando sem rede (ex.: concluir aula sincroniza depois), indicador visível de modo offline.
