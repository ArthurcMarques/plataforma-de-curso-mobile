# Erros HTTP da API

As rotas usam estes critérios:

| Código | Situação |
| --- | --- |
| 400 | ID inválido, DTO inválido, valores incompatíveis ou referência inexistente enviada no corpo. |
| 401 | Credenciais de login incorretas ou token ausente, inválido ou expirado. |
| 403 | Perfil sem permissão para a operação ou registro existente fora do escopo do usuário. |
| 404 | Rota inexistente ou registro solicitado pela URL inexistente. |
| 409 | Duplicidade, matrícula repetida, conflito de transação ou exclusão impedida por vínculos. |
| 500 | Falha interna inesperada, sem expor detalhes do banco ao cliente. |
| 503 | Falha de disponibilidade/conexão reconhecida pelo Prisma. |

Listagens sem resultados retornam 200 com lista vazia.
A autenticação ocorre antes da autorização e da execução do controller.
Operações proibidas ao perfil retornam 403 sem executar a escrita, mesmo que o
ID não corresponda a um registro. Nas operações permitidas, um alvo inexistente
retorna 404. Um ID relacionado enviado no corpo, por exemplo categoria ao criar
curso, é um dado de entrada: referência inválida retorna 400.

Nas consultas por ID, uma consulta adicional somente da chave distingue 403 de
404 quando o registro não pertence ao escopo. Isso permite distinguir a existência
do registro, mas não devolve seus dados privados.

O filtro global registrado no AppModule traduz erros conhecidos do Prisma.
Os códigos e mensagens de exceções HTTP do NestJS continuam preservados.
O Swagger documenta as respostas gerais e as específicas de cada operação.

## Execução local

Na raiz, reconstrua a API:

```powershell
docker compose up -d --build api
```

No backend, com dependências e cliente Prisma já preparados:

```powershell
npm test -- --runInBand access-policy.service.spec.ts prisma-exception.filter.spec.ts
npm run build
```

Na raiz, com a API em execução e ADMIN_TOKEN configurado com um token
administrativo, execute:

```powershell
node scripts/testar-endpoints.mjs
node scripts/testar-permissoes.mjs
```

Os scripts criam registros de teste e tentam removê-los ao terminar. Eles verificam
401, IDs inválidos, ausência após exclusão, conflitos e acesso entre perfis.
Compilação e testes não foram executados durante esta alteração.

Referência de implementação do filtro: https://docs.nestjs.com/exception-filters
