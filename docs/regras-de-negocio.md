# Regras de negócio — Hexavante Mobile

Documento de referência das regras **implementadas** no código.

---

| ID | Regra |
|----|-------|
| RN-01 | Mesmos contratos da API (`/api/v1/*`, `{ data, pagination }`) |
| RN-02 | 401 em qualquer chamada → desloga para o login |
| RN-03 | Token só no secure store; nunca em texto claro ou log |
| RN-04 | Listas longas com `FlatList` (nunca `ScrollView` com centenas de itens) |
| RN-05 | Falha de rede nunca trava a UI (timeout + retry com backoff) |
| RN-06 | Conflito local × servidor resolve a favor do servidor |
