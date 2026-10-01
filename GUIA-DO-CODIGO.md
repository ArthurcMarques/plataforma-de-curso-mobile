# Guia do código

Os comentários em português descrevem responsabilidades e decisões do código.
Dependências, cliente Prisma gerado e migrations existentes não foram modificados.
Arquivos JSON não receberam comentários porque o formato não os permite.

## Caminho de uma requisição

1. `frontend/src/components/AuthGate.tsx` confirma a sessão com `/auth/me`.
2. `frontend/src/router/AppRoutes.tsx` seleciona as páginas do perfil.
3. As páginas usam `hooks/useAppData.ts` para carregar e alterar o estado compartilhado.
4. `services/contracts.ts` converte os campos da interface em DTOs da API.
5. `services/api.ts` envia o token e valida as respostas normalizadas com os modelos Zod.
6. No backend, a estratégia JWT consulta o perfil atual; `AccessGuard` aplica a política.
7. Leituras passam pelos filtros de `AccessPolicyService` e retornam pelo interceptor.
   Escritas autorizadas seguem pelo controller até o serviço e o Prisma.

Esconder um botão no frontend não concede nem revoga permissões na API.
O escopo inclui a propriedade do curso e os vínculos de matrícula conforme o recurso.

## Organização

- `backend/src/<recurso>/`: controller para HTTP, DTOs para validação, serviço para
  persistência e módulo para registrar as dependências. As classes em `entities/`
  são referências; as tabelas são definidas em `backend/prisma/schema.prisma`.
- `frontend/src/models/`: contratos dos dados normalizados e validação em tempo de execução.
- `frontend/src/pages/`: formulários e áreas por perfil. `CourseDetailPage` restringe
  as coleções ao curso aberto antes de reutilizar os formulários de módulos, aulas e avaliações.
- `frontend/src/components/`: autenticação, layout e componentes de apresentação compartilhados.
- `scripts/`: carga direta pelo Prisma, manutenção SQL e verificações HTTP.
  A carga mantém inserções parciais em caso de erro; não possui transação global.
- `compose.yaml` e Dockerfiles: banco, pgAdmin, compilação e execução dos serviços.
  O Nginx serve o frontend e encaminha `/backend` à API.

## Configurações sem comentários embutidos

- `package.json`: dependências e comandos de cada aplicação.
- `package-lock.json`: versões resolvidas pelo npm; deve ser atualizado pelo gerenciador.
- `tsconfig*.json`: opções de compilação TypeScript.
- `backend/nest-cli.json`: configuração do compilador e estrutura NestJS.
- `docker/pgadmin/servers.json`: conexão pré-cadastrada do pgAdmin com o serviço PostgreSQL.

## Verificação desta alteração

As alterações no código adicionam comentários e preservam as linhas executáveis.
Não foram executados builds, testes, containers ou scripts de banco.
Os comandos e roteiros de execução continuam nos READMEs e em `frontend/VALIDACAO.md`.
