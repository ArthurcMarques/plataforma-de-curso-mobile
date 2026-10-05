# Refatoração e correção do build

O log com 29 erros foi causado por referências introduzidas antes de concluir a
refatoração: faltavam AccessPolicyModule, AuthenticatedRequest e a atualização
da chamada feita pela estratégia JWT. Esses pontos foram completados.

## Estrutura do tutorial preservada

Os 14 recursos continuam com module, controller, service, dto e entities nas
mesmas pastas. Prisma e auth permanecem em src/prisma e src/auth.
As consultas agora percorrem controller → service → política de acesso → Prisma.
O interceptor que devolvia resultados sem executar o controller foi removido.
O guard continua validando parâmetros e autorizando escritas; a estratégia JWT
continua consultando o perfil atual no banco.

AccessPolicyModule compartilha a política com os módulos dos recursos, sem
dependência circular com o módulo de autenticação. A consulta interna da sessão
foi separada das leituras públicas que exigem o usuário autenticado.

## Outras correções

- Removida a aplicação duplicada do guard JWT no controller de usuários.
- Consulta de propriedade do curso reduzida a uma consulta ao banco.
- Encerramento do Prisma ao finalizar a aplicação.
- start:prod alinhado ao caminho dist/src/main.js usado no Dockerfile.
- Carregamento paralelo das coleções no frontend, com cancelamento ao recarregar
  ou sair da área. Uma resposta antiga não substitui o carregamento mais recente.
- Resposta 401 atrasada não encerra um login posterior.
- Novo alerta cancela o temporizador do alerta anterior.
- Bloqueio de cliques repetidos no progresso enquanto a gravação está pendente.
- Testes básicos isolam dependências; o teste de fluxo cobre a injeção e o
  encaminhamento de leituras dos 14 recursos, sem banco real.

Não houve alteração de schema, migrations, rotas ou permissões de negócio.
O GUIA-DO-CODIGO.md tinha alterações locais do usuário e foi preservado; a
descrição antiga sobre o interceptor deve ser lida à luz deste novo fluxo.

## Validação para executar

Na raiz:

```powershell
docker compose up -d --build
```

No backend, com dependências instaladas e cliente Prisma gerado:

```powershell
npm run build
npm test -- --runInBand
```

No frontend, com dependências instaladas:

```powershell
npm run build
node --experimental-strip-types --test tests/contracts.test.mjs
```

Na raiz, com a API iniciada e ADMIN_TOKEN definido, execute os scripts
testar-endpoints.mjs e testar-permissoes.mjs da pasta scripts.
Eles criam dados próprios e tentam removê-los ao terminar.

Confira também login, listagens por perfil, abertura de curso e matrículas,
cliques rápidos no progresso e atualização dos alertas. Os comandos acima não
foram executados pelo assistente; foram conferidas as referências e o diff.
