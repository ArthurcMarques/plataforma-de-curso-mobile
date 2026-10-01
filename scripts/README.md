# Scripts do projeto

Os scripts devem ser executados manualmente. Nenhum deles inicia a API.

Todos ficam em `plataforma-cursos/scripts/`. Os comandos `node scripts/...`
abaixo devem ser executados na raiz de `plataforma-cursos`.

## Popular o banco

Requer Node.js 20+ no host, API em execucao e migrations aplicadas.
Nao precisa executar `npm install` nem instalar dependencias para o script.
Com Docker, inicie os servicos e execute:

```powershell
docker compose up -d
node scripts/popular-banco.mjs
```

Caso tenha alterado `API_PORT`, passe a URL explicitamente (o script nao le `.env`):

```powershell
node scripts/popular-banco.mjs http://localhost:3001
```

Sem Node instalado no host, use o Node do container da API, a partir da raiz:

```powershell
Get-Content -Raw scripts/popular-banco.mjs | docker compose exec -T api node --input-type=module
```

A carga usa a API NestJS, que gera os hashes das senhas e os IDs. Cria 28
registros distribuidos pelas 14 tabelas: dois usuarios, categoria, dois cursos,
dois modulos, seis aulas, duas matriculas, quatro progressos, duas avaliacoes,
trilha, dois vinculos de cursos, certificado, plano, assinatura e pagamento.
O primeiro curso fica concluido e o segundo parcialmente concluido.
URLs de aulas e transacao financeira sao ficticias; nao ha cobranca real.

O terminal mostra os emails e uma senha aleatoria para entrar no frontend.
Cada execucao adiciona um conjunto novo, identificado por UUID nos nomes e
emails. Nao e idempotente: repetir adiciona dados. Nao apaga nem altera dados
preexistentes, nao presume IDs fixos e nao executa o script de limpeza.

Se houver falha, o processo retorna codigo 1 e mantem os registros parciais.
Nao existe transacao global entre requisicoes HTTP. Confira as rotas/IDs
impressos e o UUID do conjunto antes de repetir; em timeout, a ultima operacao
pode ter sido persistida mesmo sem resposta. Sucesso retorna codigo 0.

O script foi preparado sem executar a carga no banco. Para conferir sintaxe
sem criar dados e ver a ajuda:

```powershell
node --check scripts/popular-banco.mjs
node scripts/popular-banco.mjs --help
```

## Limpar os dados

`limpar-dados.sql` apaga todos os registros dos 14 modelos em `public` e reinicia
as sequencias de IDs. Preserva tabelas, enums e `_prisma_migrations`.
Nao cria tabelas nem aplica migrations. Nao usa CASCADE: referencias externas
as tabelas listadas fazem a operacao falhar em vez de apagar outras tabelas.

1. Pare a API com Ctrl+C ou `docker compose stop api` na raiz.
2. No pgAdmin, selecione o mesmo banco usado pelo `DATABASE_URL`.
3. Confira o banco e o schema. O script usa `public` explicitamente.
4. Abra `scripts/limpar-dados.sql` no Query Tool e execute o arquivo inteiro.

O COMMIT confirma a exclusao. Se ocorrer um erro, execute `ROLLBACK;` antes
de tentar novamente. Esta limpeza e opcional para os testes abaixo.

## Testar os endpoints

Requer Node.js 20 ou superior e as tabelas ja criadas pelas migrations.
Nao requer novas dependencias. Na pasta backend:

```powershell
npm run build
npm run start:dev
```

Em outro terminal, na raiz de `plataforma-cursos`:

```powershell
node scripts/testar-endpoints.mjs
```

Se usar outra porta, informe o endereco:

```powershell
node scripts/testar-endpoints.mjs http://localhost:3001
```

O script verifica a rota raiz e a documentacao JSON do Swagger. Para cada um
dos 14 recursos, verifica POST, GET de listagem, GET individual, PATCH e DELETE,
alem de POST invalido com resposta 400, persistencia da atualizacao e exclusao.
Confere valores e IDs, incluindo chaves compostas e valores Decimal.
Tambem verifica o login e a configuracao Bearer no Swagger. O cadastro e feito
sem token; o JWT e obtido automaticamente e enviado nas requisicoes seguintes.
Nao precisa informar JWT_SECRET nem colar um token no script.

Verifica login invalido (400), usuario inexistente e senha incorreta (401),
e bloqueio das quatro rotas protegidas de usuario sem token ou com token invalido.
Confere ausencia de SenhaHash e password nas respostas de usuario, inclusive
listagens e exclusao. Confere que atualizar o nome preserva a senha; depois troca
a senha, rejeita a antiga e valida login e acesso autenticado com a nova.
Uma execucao completa deve terminar com zero falhas; a contagem agora inclui
as verificacoes adicionais de autenticacao.

Cria dados na ordem das dependencias e utiliza os IDs retornados, sem supor ID 1.
O PATCH altera parte dos campos e verifica que os demais foram preservados.
O teste nao valida todas as regras de negocio ou todos os casos de erro.

Ao terminar, tenta excluir apenas os dados criados na propria execucao,
na ordem inversa das dependencias, inclusive quando um teste falha.
Se a API cair, uma requisicao sofrer timeout ou o processo for interrompido,
podem restar registros de teste. Os IDs e erros de limpeza aparecem no terminal
quando disponiveis. O script nao altera nem exclui intencionalmente registros
preexistentes e nao executa o SQL de limpeza.

Um resultado com falhas retorna codigo de saida 1; sucesso retorna 0.
