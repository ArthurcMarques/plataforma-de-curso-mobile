# Scripts do projeto

Os scripts devem ser executados manualmente. Nenhum deles inicia a API.

Todos ficam em `plataforma-cursos/scripts/`. Os comandos `node scripts/...`
abaixo devem ser executados na raiz de `plataforma-cursos`.

## Administrador e token para scripts

Depois de aplicar as migrations e cadastrar uma conta, promova-a explicitamente:

```powershell
Get-Content -Raw scripts/promover-admin.sql | docker compose exec -T postgres psql -U plataforma -d plataforma_cursos -v "email=seu-email@example.com"
```

Confira `UPDATE 1`. O arquivo usa variaveis do psql e deve ser executado pelo
comando acima, nao diretamente no Query Tool. Nao cria usuarios nem altera senhas.

Somente para os testes CRUD e de permissoes, obtenha o token administrativo
no PowerShell (ajuste a URL se mudou a porta):

```powershell
$apiUrl = 'http://localhost:3000'
$adminCredential = Get-Credential -Message 'Conta administradora da plataforma (email e senha)'
$loginBody = @{ email = $adminCredential.UserName; password = $adminCredential.GetNetworkCredential().Password } | ConvertTo-Json
$env:ADMIN_TOKEN = (Invoke-RestMethod -Method Post -Uri "$apiUrl/auth/login" -ContentType 'application/json' -Body $loginBody).access_token
Remove-Variable loginBody, adminCredential
```

O token expira em uma hora; refaca o login se necessario. Nao coloque o token
em arquivos versionados. Ao terminar: `Remove-Item Env:ADMIN_TOKEN`.

```powershell
node scripts/testar-permissoes.mjs
node scripts/testar-endpoints.mjs
```

O teste de permissoes cria contas separadas de alunos e instrutores, verifica
401/403/404, isolamento de listagens, alteracao de perfil, conteudo sem matricula,
tentativas de transferir conteudo de outro instrutor e acesso financeiro alheio.
Tenta limpar somente suas fixtures ao terminar; uma interrupcao pode deixar dados.
Nenhum destes testes foi executado durante a implementacao.

## Popular o banco

Insere diretamente no PostgreSQL usando Prisma, sem HTTP, login ou ADMIN_TOKEN.
Usa DATABASE_URL e as dependencias ja instaladas na imagem do backend. O container
`api` deve estar em execucao, com o backend compilado e as migrations aplicadas.
O servidor HTTP nao e usado pela carga; o container fornece apenas o Node e o Prisma.
Nao precisa existir nenhum usuario ou administrador antes da carga.

Na raiz do projeto, execute (na primeira vez ou apos atualizar o backend):

```powershell
docker compose up --build -d
node scripts/popular-banco.mjs
```

O comando Node no host apenas encaminha o arquivo atual ao container via Docker.
Nao e preciso executar `npm install` no host, nem reconstruir a imagem quando
somente este script mudar. API_PORT nao afeta a carga e URLs de API nao sao aceitas.
Sem Node instalado no host, use este comando equivalente no PowerShell:

```powershell
Get-Content -Raw -Encoding utf8 scripts/popular-banco.mjs | docker compose exec -T api node --input-type=module - --database-worker
```

A carga usa Prisma para gerar os IDs e bcrypt para gerar os hashes das senhas.
Os perfis sao gravados diretamente no banco, sem alterar as permissoes das rotas
da aplicacao. Cria:

- 10 alunos, 3 instrutores e 2 administradores (15 contas de demonstracao).
- 4 cursos: HTML e CSS, JavaScript, React e NestJS, distribuidos entre os instrutores.
- 3 modulos por curso, com 3 aulas por modulo: video (20 min), texto (25 min)
  e quiz (15 min). Cada curso tem 9 aulas e 3 horas: 12 modulos e 36 aulas no total.
- 40 matriculas (cada aluno nos quatro cursos), 243 progressos e 40 avaliacoes.
- 14 certificados, somente para as matriculas com todas as aulas concluidas.
- Categoria, trilha com os quatro cursos, plano, 10 assinaturas e 10 pagamentos.

Na primeira execucao em um banco vazio, sao 431 registros nas 14 tabelas.
Nas seguintes, sao 415 registros novos quando as 15 contas e a categoria ja existem. Cada curso tem alunos
com progresso completo, de um modulo ou de dois modulos. "Cursos completos"
significa estrutura preenchida de modulos e aulas; os links de video, texto e
quiz sao exemplos ficticios, sem material didatico hospedado. As transacoes
financeiras tambem sao ficticias, sem cobranca real.

Todas as contas de demonstracao usam a senha **123456**, armazenada como hash bcrypt:

- `aluno1@example.com` ate `aluno10@example.com`.
- `instrutor1@example.com` ate `instrutor3@example.com`.
- `admin1@example.com` e `admin2@example.com`.

O terminal mostra os logins e perfis ao terminar. Se um desses emails ja existir,
a carga reutiliza o ID e atualiza nome, perfil e senha para os valores de
demonstracao. Nao modifica outras contas. Contas antigas com UUID no email nao
sao renomeadas nem removidas automaticamente.

Os nomes sao apresentados sem "Demo" ou UUID: Desenvolvimento Web,
Desenvolvimento Full Stack, HTML e CSS na pratica, JavaScript na pratica,
React na pratica, NestJS na pratica e Plano Mensal. Certificados e transacoes
possuem codigos unicos com prefixos CERT e TRX, sem rotulos de demonstracao.

Cada execucao adiciona novos cursos e dados relacionados. Portanto, a carga
completa nao e idempotente, embora os usuarios e a categoria Desenvolvimento
Web sejam reutilizados. Nao presume IDs fixos nem executa limpeza. Registros
antigos com nomes "Demo ..." nao sao alterados por esta atualizacao do script.

Se houver falha, o processo retorna codigo 1 e mantem os registros parciais.
Nao existe transacao global entre as insercoes. Confira os modelos/IDs
impressos antes de repetir; em falha de conexao, a ultima operacao
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
sem token; as operacoes de gestao usam ADMIN_TOKEN. O token da conta criada
tambem e testado para acesso proprio. Nao precisa informar JWT_SECRET.

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
