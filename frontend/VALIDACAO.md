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
