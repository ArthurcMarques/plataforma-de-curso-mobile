# Autenticação no Swagger

Abra `http://127.0.0.1:3000/api` (ajuste a porta se necessário).

1. Execute `POST /auth/login` com `email` e `password` de uma conta existente.
2. Copie apenas o valor de `access_token` da resposta.
3. Clique em **Authorize**, cole o token no esquema **token**, sem aspas nem
   prefixo `Bearer`, e confirme.
4. Execute `GET /auth/me` e depois a rota desejada. O curl gerado deve conter
   `Authorization: Bearer ...`.

O frontend guarda sua sessão separadamente; entrar nele não autentica o Swagger.
Um token ausente, inválido ou expirado resulta em 401. Refaça o login se expirar.
A autorização continua dependendo do perfil e da propriedade dos registros.
O login, o endpoint raiz e POST /usuario são públicos. O cadastro não exige nem
valida token, mesmo quando Authorization é enviado.
No POST /usuario, o campo opcional perfil aceita ALUNO, INSTRUTOR ou ADMINISTRADOR.
Qualquer pessoa pode escolher qualquer perfil, inclusive ADMINISTRADOR.
Se omitido, o perfil será ALUNO.
Para alterar o perfil de uma conta existente, use PATCH /usuario/{id}/perfil.

Após alterações nos controllers, reconstrua a API na raiz do projeto:

```powershell
docker compose up -d --build api
```

Recarregue o Swagger. Confira também que uma chamada sem token retorna 401 e
que login/cadastro continuam disponíveis sem autorização. Este roteiro não foi
executado durante a alteração.
