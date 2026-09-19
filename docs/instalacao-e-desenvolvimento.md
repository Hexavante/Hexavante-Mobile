# Instalação e desenvolvimento — Hexavante Mobile

Documento de referência do setup **implementado** neste repositório.

---

## Pré-requisitos

Node.js 22+, app **Expo Go** no celular (dev), Android Studio/Xcode para emuladores.

## Passo a passo

```bash
git clone https://github.com/Hexavante/Hexavante-Mobile.git
cd Hexavante-Mobile
npm install
npx expo start   # QR para o Expo Go (mesma rede Wi-Fi ou --tunnel)
```

## Nova tela (checklist)

1. Rota em `src/app/` (aba, pilha ou modal) com loading/erro.
2. Dados só via `src/lib/` (mesmos contratos da API).
3. Componentes em `src/components/` (reutilizável nasce aqui).
4. `npm run lint` verde + teste em aparelho real.

## Comandos úteis

`npm start` · `npm run android` · `npm run ios` · `npm run web` · `npm run lint`.
