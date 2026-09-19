# DER conceitual — Hexavante Mobile

Documento de referência das entidades **consumidas** (o mobile não tem banco próprio).

---

```
SESSÃO_LOCAL (token seguro, usuário, expiração)
CATÁLOGO_CACHE (cursos, simulados, paginação)
PROGRESSO_LOCAL (aula, posição do vídeo, concluída?)
FILA_OFFLINE (ação, payload, tentativas)
```

Tudo espelha a API; o servidor continua fonte da verdade. Ver o lógico em [der-logico.md](der-logico.md).
