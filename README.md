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

Este trabalho unifica o repositorio e a infraestrutura. O frontend original
ainda tem contrato de JSON Server; a integracao dos CRUDs com NestJS esta
pendente. No Docker, `VITE_API_URL=/backend` aponta para a API real, mas a
interface exibira erro ao carregar as colecoes enquanto esses contratos
nao forem adaptados. Exemplos conferidos nos fontes:

- O frontend pede `/usuarios` e `/cursos`; o backend oferece `/usuario`
  e `/curso` (tambem ha diferencas nas outras colecoes).
- O frontend espera `id` e `nomeCompleto`; a API retorna `ID_Usuario`
  e `NomeCompleto`. Enums e outros campos tambem diferem.
- A listagem de usuarios exige JWT. O frontend ainda nao tem fluxo de
  login nem envio de Bearer token.
- O modelo de usuario do frontend exige `senha`; a API corretamente nao
  devolve senhas. Esse campo precisa sair do contrato de leitura.

O JSON Server nao e um servico do Compose. O script legado `npm run server`
e `db.json` foram preservados para referencia. O README de cada projeto
tambem preserva as instrucoes anteriores; este README descreve o Compose.

## Validacao a executar

Nao foram executados instalacoes, builds, testes, containers ou migracoes
durante a preparacao. Depois de subir os servicos:

```powershell
Invoke-WebRequest http://localhost:3000/
Invoke-WebRequest http://localhost:3000/api
Invoke-WebRequest http://localhost:8080/
Invoke-WebRequest http://localhost:8080/backend/curso
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

## Operacao

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
