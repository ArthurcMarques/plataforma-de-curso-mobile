# Plataforma de cursos

Monorepo local com `backend/` (NestJS 11 + Prisma 7), `frontend/`
(React 18 + Vite) e PostgreSQL. Os projetos foram copiados das pastas
originais, que permanecem intactas. O novo Git tem historico proprio;
nao importa os historicos anteriores e nao possui remoto configurado.
Os arquivos `.env` originais nao foram copiados nem versionados.

## Executar com Docker (PowerShell)

Instale e inicie o Docker Desktop com containers Linux e Compose v2.
Nao e necessario instalar Node ou PostgreSQL no host para esta modalidade.
Execute a partir desta pasta:

```powershell
Copy-Item .env.example .env
notepad .env
```

Preencha `POSTGRES_PASSWORD` e `JWT_SECRET` com valores aleatorios proprios.
Use apenas letras e numeros em `POSTGRES_PASSWORD`, pois ela compoe a URL
de conexao. O `.env` da raiz configura o Compose; o antigo `backend/.env`
nao participa deste ambiente.

```powershell
docker compose config --quiet
docker compose up --build -d
docker compose ps
docker compose logs -f api
```

O build instala dependencias com `npm ci`, gera o Prisma Client e compila
os projetos dentro das imagens. A API executa `prisma migrate deploy`
antes de iniciar. As migracoes existentes criam o banco novo; dados do
banco antigo e do `frontend/db.json` nao sao importados.

| Recurso | Endereco padrao |
| --- | --- |
| Frontend | http://localhost:8080 |
| API | http://localhost:3000 |
| Swagger | http://localhost:3000/api |
| API via proxy do frontend | http://localhost:8080/backend/ |

O PostgreSQL fica na rede interna como `postgres:5432`, com banco
`plataforma_cursos`, usuario `plataforma` e volume persistente `postgres_data`.
O navegador usa `/backend`, encaminhado pelo Nginx; o nome `api` e resolvido
somente dentro da rede Docker. As chamadas por esse proxy nao exigem CORS.
As portas externas podem ser alteradas no `.env`.

## Estado da integracao funcional

O frontend consome as 14 colecoes do NestJS por `/backend`. A camada em
`frontend/src/services/contracts.ts` converte rotas, nomes de campos,
enums, IDs numericos, decimais e datas. Progresso e vinculos de trilhas usam
chaves compostas, convertidas em dois segmentos nas rotas de alteracao/exclusao.

Ao abrir a interface, use **Criar uma conta** para cadastrar o primeiro
usuario e depois entre com e-mail e senha. O JWT fica em `sessionStorage`
e acompanha as chamadas como Bearer token. Sair ou receber HTTP 401 remove
a sessao e retorna ao acesso. A API define a expiracao do token em uma hora.

Senhas sao apenas entradas de cadastro/alteracao, nunca dados de leitura.
Na edicao de usuario, senha vazia preserva a senha existente. Somente usuarios
com perfil INSTRUTOR aparecem na selecao de instrutor dos cursos.
Datas de cadastro, matricula, avaliacao e emissao sao geradas pelo backend
e aparecem como somente leitura nos formularios.

O JSON Server nao e um servico do Compose. O script legado `npm run server`
e `db.json` foram preservados para referencia. O README do backend preserva
instrucoes anteriores; este README descreve o Compose.

## Areas e permissoes

O login consulta `/auth/me` e direciona para `/aluno`, `/instrutor` ou
`/administrador`. O cadastro publico sempre cria ALUNO, mesmo que a requisicao
envie outro perfil. Perfis sao conferidos no banco a cada requisicao autenticada.

| Perfil | Area e permissoes |
| --- | --- |
| Aluno | Catalogo, matricula propria, conteudo dos cursos matriculados, marcar/desmarcar seu progresso e consultar seus certificados. Na API, pode editar a propria conta e suas avaliacoes de cursos matriculados. |
| Instrutor | Criar/editar/excluir seus cursos, modulos e aulas; consultar suas turmas e progresso dos alunos nesses cursos. Nao gerencia perfis nem financeiro de terceiros. |
| Administrador | Gestao geral pelo painel existente e alteracao dos perfis de outros usuarios na pagina inicial administrativa. |

As listagens sao limitadas no banco. IDs de registros fora do escopo retornam
404; operacoes nao permitidas retornam 403; ausencia de autenticacao retorna
401. Login, cadastro, verificacao de disponibilidade e Swagger continuam publicos.
Nao e permitido transferir conteudos para cursos de outro instrutor. Somente
administradores emitem certificados, registram pagamentos e gerenciam assinaturas.

### Ativar a atualizacao e promover o primeiro administrador

A migracao adiciona `Perfil` com valor ALUNO a todos os usuarios existentes,
sem apagar dados. Usuarios de demonstracao antigos tambem precisarao de promocao.
Execute na raiz do projeto:

```powershell
docker compose up --build -d
```

Crie sua conta na tela de acesso (ou use uma conta existente). Depois execute,
substituindo o email pelo mesmo usado no cadastro:

```powershell
Get-Content -Raw scripts/promover-admin.sql | docker compose exec -T postgres psql -U plataforma -d plataforma_cursos -v "email=seu-email@example.com"
```

O comando deve mostrar `UPDATE 1` e o perfil ADMINISTRADOR. `UPDATE 0` indica
que nao encontrou o email. Recarregue a pagina ou entre novamente. Na area
administrativa, promova os instrutores e outros administradores. A propria
conta administrativa nao pode ser rebaixada nem excluida pela API.

Os arquivos foram preparados, mas builds, migracoes e testes nao foram executados.
Veja [scripts/README.md](scripts/README.md) para os testes de permissoes e a carga.

Para desenvolver o frontend com a API do Compose em execucao:

```powershell
cd frontend
npm ci
npm run dev
```

O proxy do Vite encaminha `/backend` para `http://127.0.0.1:3000`.
Se mudar `API_PORT`, ajuste o destino em `frontend/vite.config.ts`.

## Validacao a executar

Nao foram executados instalacoes, builds, testes, containers ou migracoes
durante a preparacao. Depois de subir os servicos:

```powershell
Invoke-WebRequest http://localhost:3000/
Invoke-WebRequest http://localhost:3000/api
Invoke-WebRequest http://localhost:8080/
# As rotas de dados agora exigem Bearer token; sem token retornam 401.
docker compose exec api ./node_modules/.bin/prisma migrate status
```

Para testar o backend fora do Docker, instale Node.js 22 e execute:

```powershell
cd backend
npm ci
npx prisma generate
npm run build
npm test -- --runInBand
cd ../frontend
npm ci
npm run build
cd ..
```

Os testes existentes podem precisar de mocks/configuracao de banco;
nao foram reescritos neste trabalho.

Confira tambem [o roteiro de validacao do frontend](frontend/VALIDACAO.md).

## Operacao

### Scripts na raiz

Os scripts compartilhados ficam em [`scripts/`](scripts/README.md):

- `popular-banco.mjs`: adiciona 4 cursos com modulos/aulas, 10 alunos,
  3 instrutores, 2 novos administradores e dados relacionados nas 14 tabelas.
- `testar-endpoints.mjs`: verifica os endpoints e tenta remover os dados de teste.
- `limpar-dados.sql`: apaga todos os registros das tabelas da aplicacao.
- `promover-admin.sql`: promove uma conta existente pelo email, via psql.
- `testar-permissoes.mjs`: confere perfis, escopos e tentativas de acesso indevido.

Com a API em execucao e `ADMIN_TOKEN` configurado conforme o README dos scripts,
execute da raiz (Node.js 20+):

```powershell
node scripts/popular-banco.mjs
```

Os logins de demonstracao aparecem no terminal. Cada execucao adiciona um
novo conjunto; nao e necessario limpar o banco antes. Consulte o README dos
scripts para porta alternativa, execucao pelo container e comportamento em falhas.

### Banco pelo navegador (pgAdmin)

Acrescente ao `.env` existente (nao sobrescreva as senhas atuais):

```dotenv
PGADMIN_EMAIL=admin@example.com
PGADMIN_PASSWORD=escolhaUmaSenhaParaOPainel
PGADMIN_PORT=5050
```

Execute na raiz:

```powershell
docker compose up -d pgadmin
```

Abra http://localhost:5050 e entre com `PGADMIN_EMAIL` e `PGADMIN_PASSWORD`.
O servidor **Docker > Plataforma de cursos** ja estara cadastrado no primeiro
inicio. Ao conecta-lo, informe a senha `POSTGRES_PASSWORD` do `.env`.
A senha do painel e a senha do banco sao credenciais separadas.

Expanda **Databases > plataforma_cursos > Schemas > public > Tables**.
Clique com o botao direito na tabela desejada, por exemplo `Usuario`, e
selecione **View/Edit Data > All Rows** para conferir os registros.

O pgAdmin conecta a `postgres:5432` pela rede Docker; o banco continua sem
porta publicada no host. As configuracoes do painel persistem no volume
`pgadmin_data`. Depois do primeiro inicio, mudar as variaveis de login no
`.env` nao altera a conta existente: altere a senha pelo proprio pgAdmin.

Configuracao baseada na [documentacao oficial de containers do pgAdmin](https://www.pgadmin.org/docs/pgadmin4/9.17/container_deployment.html).
O servico foi preparado, mas nao foi iniciado nem testado em runtime.

```powershell
# Parar preservando o banco
docker compose down
# Recompilar apos alteracoes (nao ha hot reload)
docker compose up --build -d
# Abrir uma sessao SQL no banco
docker compose exec postgres psql -U plataforma -d plataforma_cursos
```

Nao use `docker compose down -v` se quiser preservar os dados. Alterar a
senha no `.env` nao altera a senha de um banco ja inicializado no volume.

## Publicar o repositorio (opcional)

O repositorio foi criado apenas localmente. Depois de criar um repositorio
vazio chamado `plataforma-cursos` no seu provedor, execute:

```powershell
git remote add origin <URL-DO-REPOSITORIO>
git push -u origin main
```

## Referencias

- [Ordem e healthchecks no Compose](https://docs.docker.com/compose/how-tos/startup-order/)
- [Prisma em Docker](https://www.prisma.io/docs/guides/deployment/docker)
