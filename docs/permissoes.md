# Permissões — Hexavante Mobile

Documento de referência do controle de acesso **implementado**.

---

## Modelo

Sem papéis próprios: tudo deriva da sessão da plataforma.

| Estado | Acesso |
|--------|--------|
| Deslogado | Login, cadastro e catálogo público |
| Logado | Estudo, simulados, loja, perfil, salas |
| Instrutor/moderador | Mesmas telas e permissões do web (via API) |

## Regras

- Permissões do aparelho (câmera, notificações) pedidas na hora do uso, com explicação.
- Logout limpa token, cache de sessão e fila offline do usuário.
- Deep-links respeitam auth: rota privada sem sessão cai no login.
