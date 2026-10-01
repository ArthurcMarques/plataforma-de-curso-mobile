# Validacao da integracao

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
   as datas geradas pelo servidor e o codigo do certificado.
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
5. Simule falha na requisicao de alteracao de perfil apos criar uma conta (por
   exemplo, bloqueando essa URL no DevTools). O aviso deve indicar que a conta
   foi salva; uma nova tentativa deve editar o mesmo ID, sem novo POST de usuario.
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
