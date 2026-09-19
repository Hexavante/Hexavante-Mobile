# Hexavante Mobile — visão geral

Documento de referência da arquitetura **implementada** no repositório.

---

## Descrição

Aplicativo mobile da plataforma Hexavante para Android e iOS: Expo + React Native + `expo-router`, mesma conta e mesmos dados do app web.

**Stack atual:** Expo, React Native, TypeScript. Ver [stack.md](stack.md) e [instalacao-e-desenvolvimento.md](instalacao-e-desenvolvimento.md).

---

## Papel no ecossistema

| Papel | Detalhe |
|-------|---------|
| Estudo no bolso | Catálogo, aulas, simulados e progresso fora do PC |
| Paridade | Mesmos endpoints, regras e conta do web/desktop |
| Distribuição | Google Play e App Store via EAS |

## Princípios

1. Navegação por arquivos (`expo-router`); uma rota por arquivo.
2. Dados sempre da API; nada de regra duplicada além de cache/UX.
3. Mobile-first de verdade: toque, offline e telas pequenas em primeiro lugar.
