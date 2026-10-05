# Validacao da integracao

## Avaliações conforme o frontend de referência

Referência: https://github.com/ArthurcMarques/plataforma-de-cursos-react-e-json-server
(commit `be5471d`, `src/pages/ReviewsPage.tsx`). Campos: usuário, curso,
nota inteira de 1 a 5, comentário e data editável. As permissões por perfil
continuam aplicadas na API: aluno altera suas avaliações, instrutor consulta
as de seus cursos e administrador gerencia todas.

Crie uma avaliação com data anterior à atual, recarregue e confira a persistência.
Edite a data e confira novamente. Notas fora de 1–5 devem ser rejeitadas pela API.
Não é necessária migration. Para atualizar, execute na raiz:

```powershell
docker compose up -d --build api frontend
```


## Navegação dentro do curso

Roteiro manual para administrador e instrutor:

1. Em Cursos, clique no título ou em **Gerenciar curso**. Confira o resumo e as
   abas Módulos, Aulas e Avaliações. Criar um curso também abre essa página.
2. Cadastre e edite módulos: o curso deve estar preenchido e bloqueado. Limpar ou
   cancelar deve manter esse vínculo. A ordem deve ser única dentro do curso.
3. Clique em **Gerenciar aulas** de um módulo. Confira o filtro, a listagem e o
   módulo preenchido no formulário. Crie, edite e exclua uma aula sem vínculos.
4. Selecione todos os módulos e confira que só aparecem módulos/aulas do curso
   aberto. Teste dois cursos com módulos de mesma ordem para conferir o isolamento.
5. Troque abas, use Voltar/Avançar e recarregue. A aba e o filtro devem acompanhar
   o endereço. Um módulo inválido deve mostrar aviso e as aulas do curso atual.
6. Como administrador, crie/edite/exclua avaliações nessa página. O curso deve
   permanecer fixo. Confira atualização das contagens e da nota média.
7. Como instrutor, confira avaliações somente para leitura, sem formulário nem
   ações de alteração. Abra o endereço de um curso de outro instrutor: deve ficar
   indisponível. Como aluno, a rota administrativa deve redirecionar à sua área.
8. Confira os atalhos na lista geral de módulos e nas turmas do instrutor, o menu
   Cursos ativo na página interna e a disposição das abas em tela estreita.

Na raiz do projeto, reconstrua o frontend para visualizar as alterações:

```powershell
docker compose up -d --build frontend
```

Compilação, testes e validação visual deste roteiro ficam para execução local.

Instalacoes e execucao ficam a cargo do desenvolvedor. Nenhum teste de
runtime foi executado durante esta alteracao.

Testes dos adaptadores (Node.js 22.6+; nao precisam instalar dependencias):

```powershell
node --experimental-strip-types --test tests/contracts.test.mjs
```

1. Execute `npm ci` e `npm run build` nesta pasta para verificar TypeScript
   e o bundle. Na raiz, execute `docker compose up --build -d`.
2. Abra http://localhost:8080, crie uma conta, entre e recarregue a pagina.
   A sessao deve permanecer na mesma aba; sair deve retornar ao login.
   O cadastro abre a area de aluno. Promova uma conta seguindo o README da
   raiz e entre como administrador para executar os cadastros dos passos seguintes.
3. Cadastre categoria e usuario; promova esse usuario para INSTRUTOR na pagina
   inicial administrativa. Crie curso selecionando esse usuario como
   instrutor. Edite titulo, categoria e nivel; recarregue para conferir.
4. Crie modulo e aulas dos tipos Video, Texto e Quiz. Verifique os enums
   exibidos e a persistencia da URL e duracao.
5. Matricule um usuario e marque/desmarque duas aulas no progresso.
   Confira no Network as rotas `/progresso-aula/<usuario>/<aula>` e que a
   exclusao remove somente o par selecionado, inclusive apos recarregar.
6. Crie trilha e vincule dois cursos. Exclua apenas um vinculo, conferindo
   `/trilha-curso/<trilha>/<curso>` e a preservacao do outro.
7. Cadastre avaliacao e emita certificado apos concluir uma aula. Confira
   a data escolhida na avaliacao, a data gerada do certificado e seu codigo.
8. Cadastre plano, assinatura e pagamentos com Pix, Cartao e Boleto;
   edite e confira valores decimais, datas e metodo apos recarregar.
9. Edite um usuario sem preencher senha; o login antigo deve continuar
   funcionando. Depois altere a senha e confira o novo login.
10. Tente cadastrar um e-mail ja existente e excluir uma categoria usada
    por um curso. A tela deve mostrar erro sem anunciar sucesso ou apagar
    o formulario/registro local. Remova registros sem vinculos para testar
    exclusoes bem-sucedidas.
11. Altere `plataforma-cursos.token` no sessionStorage para um token invalido
    e recarregue: a resposta 401 deve retornar ao login. Confira tambem uma
    senha incorreta e a tentativa de acesso com a API parada.

12. Entre como aluno: confira redirecionamento para `/aluno`, matricula propria,
    abertura de conteudos e progresso. Acesse `/usuarios` manualmente: deve
    retornar a `/aluno`. Confira que outro aluno nao ve seu progresso.
13. Entre como instrutor: confira `/instrutor`, cursos proprios, criacao de
    modulos/aulas e turmas. Outro instrutor nao deve conseguir editar seus cursos.
14. Como administrador, altere um instrutor para aluno; uma nova chamada da API
    com o token antigo deve perder a permissao. Recarregue a aba para atualizar
    a area visual. Confira os testes automatizados em `scripts/testar-permissoes.mjs`.

Datas sem horario sao enviadas como meia-noite UTC. Campos textuais nulos
sao apresentados vazios; duracao nula aparece como zero.

## Formularios por perfil

Validacoes manuais adicionais (nao executadas durante a alteracao):

1. Aluno: confira os menus Catalogo, Meus cursos e progresso, Meus certificados,
   Minhas avaliacoes e Minha conta. O catalogo oferece matricula; os conteudos e
   checkboxes de progresso ficam na pagina dos cursos matriculados.
2. Sem matriculas, o formulario de avaliacao deve ficar desabilitado. Depois de
   se matricular, selecione um curso, salve e edite uma avaliacao. Nao deve existir
   seletor de outro usuario, nem cursos sem matricula no seletor.
3. Instrutor: crie um curso sem escolher um instrutor. O nome deve aparecer somente
   para leitura, e a requisicao deve usar seu proprio ID. Cadastre modulo e aula;
   "Ver turmas" deve abrir a area do instrutor, sem formulario administrativo de progresso.
4. Administrador: cadastre uma conta de cada perfil em Usuarios e perfis. Confirme
   o perfil apos recarregar e fazer login com a nova conta. Filtre a listagem por
   perfil. Ao editar sua propria conta, nao deve ser possivel mudar seu perfil
   nem aparecer a acao de exclui-la.
5. Ao criar uma conta, confira no DevTools um unico POST /usuario contendo perfil,
   sem PATCH posterior. Na edicao de uma conta existente, mudar o perfil ainda
   usa PATCH /usuario/{id}/perfil; uma falha deve manter o formulario para tentar novamente.
6. Nos tres perfis, use Minha conta para editar nome/email, mantendo a senha em
   branco. Confira que o nome no topo e atualizado. Senhas diferentes devem
   impedir o envio; com senhas iguais, confira o login com a nova senha.
7. Durante um envio lento, confira os formularios e botoes de edicao desabilitados.
   Depois de erro, os campos devem continuar preenchidos e permitir nova tentativa.
8. Em outra sessao administrativa, altere o perfil do usuario. Ao voltar o foco
   para a aba dele, a area e os menus devem mudar, sem manter dados da area anterior.

Para validar compilacao e contratos antes do roteiro, execute em `frontend/`:

```powershell
npm run build
node --experimental-strip-types --test tests/contracts.test.mjs
```
