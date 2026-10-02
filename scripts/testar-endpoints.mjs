// Node.js 20+; nenhuma dependencia adicional. A API deve estar rodando.
// Na raiz do monorepo: node scripts/testar-endpoints.mjs [http://localhost:3000]
// Cria dados proprios e tenta remove-los mesmo quando um teste falha.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const baseUrl = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '');
const token = randomUUID();
const records = {};
const cleanup = [];
let accessToken;
const adminToken = process.env.ADMIN_TOKEN;
let credentials;
let passed = 0;
let failures = 0;
const now = new Date().toISOString();
const later = new Date(Date.now() + 30 * 86400000).toISOString();
const id = (route, key) => records[route][key];

// Campos no JSON de entrada -> campos retornados pelo banco.
// Cada cenário fornece cadastro, alteração e mapeamento esperado dos campos retornados.
const scenarios = [
  { route: 'usuario', keys: ['ID_Usuario'],
    body: () => ({ name: 'Usuario teste', email: `${token}@example.com`, password: 'teste123' }),
    patch: { name: 'Usuario atualizado' },
    map: { name: 'NomeCompleto', email: 'Email' } },
  { route: 'categoria', keys: ['ID_Categoria'],
    body: () => ({ nome: `Categoria ${token}`, descricao: 'Categoria de teste' }),
    patch: { descricao: 'Descricao atualizada' },
    map: { nome: 'Nome', descricao: 'Descricao' } },
  { route: 'curso', keys: ['ID_Curso'],
    body: () => ({ titulo: 'Curso teste', descricao: 'Curso de teste',
      idInstrutor: id('usuario', 'ID_Usuario'), idCategoria: id('categoria', 'ID_Categoria'),
      nivel: 'INICIANTE', dataPublicacao: now, totalAulas: 1, totalHoras: 1.5 }),
    patch: { titulo: 'Curso atualizado' },
    map: { titulo: 'Titulo', descricao: 'Descricao', idInstrutor: 'ID_Instrutor',
      idCategoria: 'ID_Categoria', nivel: 'Nivel', dataPublicacao: 'DataPublicacao',
      totalAulas: 'TotalAulas', totalHoras: 'TotalHoras' } },
  { route: 'modulo', keys: ['ID_Modulo'],
    body: () => ({ idCurso: id('curso', 'ID_Curso'), titulo: 'Modulo teste', ordem: 1 }),
    patch: { titulo: 'Modulo atualizado' },
    map: { idCurso: 'ID_Curso', titulo: 'Titulo', ordem: 'Ordem' } },
  { route: 'aula', keys: ['ID_Aula'],
    body: () => ({ idModulo: id('modulo', 'ID_Modulo'), titulo: 'Aula teste',
      tipoConteudo: 'VIDEO', urlConteudo: 'https://example.com/aula', duracaoMinutos: 15, ordem: 1 }),
    patch: { titulo: 'Aula atualizada' },
    map: { idModulo: 'ID_Modulo', titulo: 'Titulo', tipoConteudo: 'TipoConteudo',
      urlConteudo: 'URL_Conteudo', duracaoMinutos: 'DuracaoMinutos', ordem: 'Ordem' } },
  { route: 'matricula', keys: ['ID_Matricula'],
    body: () => ({ idUsuario: id('usuario', 'ID_Usuario'), idCurso: id('curso', 'ID_Curso') }),
    patch: { dataConclusao: later },
    map: { idUsuario: 'ID_Usuario', idCurso: 'ID_Curso', dataConclusao: 'DataConclusao' } },
  { route: 'progresso-aula', keys: ['ID_Usuario', 'ID_Aula'],
    body: () => ({ idUsuario: id('usuario', 'ID_Usuario'), idAula: id('aula', 'ID_Aula'), status: 'CONCLUIDO' }),
    patch: { dataConclusao: later },
    map: { idUsuario: 'ID_Usuario', idAula: 'ID_Aula', status: 'Status', dataConclusao: 'DataConclusao' } },
  { route: 'avaliacao', keys: ['ID_Avaliacao'],
    body: () => ({ idUsuario: id('usuario', 'ID_Usuario'), idCurso: id('curso', 'ID_Curso'),
      nota: 5, comentario: 'Teste' }),
    patch: { nota: 4, comentario: 'Atualizado' },
    map: { idUsuario: 'ID_Usuario', idCurso: 'ID_Curso', nota: 'Nota', comentario: 'Comentario' } },
  { route: 'trilha', keys: ['ID_Trilha'],
    body: () => ({ titulo: 'Trilha teste', descricao: 'Teste', idCategoria: id('categoria', 'ID_Categoria') }),
    patch: { titulo: 'Trilha atualizada' },
    map: { titulo: 'Titulo', descricao: 'Descricao', idCategoria: 'ID_Categoria' } },
  { route: 'trilha-curso', keys: ['ID_Trilha', 'ID_Curso'],
    body: () => ({ idTrilha: id('trilha', 'ID_Trilha'), idCurso: id('curso', 'ID_Curso'), ordem: 1 }),
    patch: { ordem: 2 },
    map: { idTrilha: 'ID_Trilha', idCurso: 'ID_Curso', ordem: 'Ordem' } },
  { route: 'certificado', keys: ['ID_Certificado'],
    body: () => ({ idUsuario: id('usuario', 'ID_Usuario'), idCurso: id('curso', 'ID_Curso'),
      idTrilha: id('trilha', 'ID_Trilha'), codigoVerificacao: `CERT-${token}` }),
    patch: { codigoVerificacao: `CERT-ATUALIZADO-${token}` },
    map: { idUsuario: 'ID_Usuario', idCurso: 'ID_Curso', idTrilha: 'ID_Trilha', codigoVerificacao: 'CodigoVerificacao' } },
  { route: 'plano', keys: ['ID_Plano'],
    body: () => ({ nome: 'Plano teste', descricao: 'Teste', preco: 49.9, duracaoMeses: 1 }),
    patch: { preco: 59.9 },
    map: { nome: 'Nome', descricao: 'Descricao', preco: 'Preco', duracaoMeses: 'DuracaoMeses' } },
  { route: 'assinatura', keys: ['ID_Assinatura'],
    body: () => ({ idUsuario: id('usuario', 'ID_Usuario'), idPlano: id('plano', 'ID_Plano'),
      dataInicio: now, dataFim: later }),
    patch: { dataFim: new Date(Date.now() + 60 * 86400000).toISOString() },
    map: { idUsuario: 'ID_Usuario', idPlano: 'ID_Plano', dataInicio: 'DataInicio', dataFim: 'DataFim' } },
  { route: 'pagamento', keys: ['ID_Pagamento'],
    body: () => ({ idAssinatura: id('assinatura', 'ID_Assinatura'), valorPago: 49.9,
      dataPagamento: now, metodoPagamento: 'PIX', idTransacaoGateway: `TESTE-${token}` }),
    patch: { metodoPagamento: 'CARTAO' },
    map: { idAssinatura: 'ID_Assinatura', valorPago: 'ValorPago', dataPagamento: 'DataPagamento',
      metodoPagamento: 'MetodoPagamento', idTransacaoGateway: 'Id_Transacao_Gateway' } },
];

async function request(method, path, expectedStatus, body, bearer = adminToken) {
  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
  } catch (error) {
    throw new Error(`${method} ${path}: falha de conexao ou timeout. Confira se a API esta rodando.`, { cause: error });
  }
  const text = await response.text();
  let data = text;
  try { data = text ? JSON.parse(text) : null; } catch { /* Resposta textual. */ }
  assert.equal(response.status, expectedStatus,
    `${method} ${path}: esperado ${expectedStatus}, recebido ${response.status}`);
  if (/^\/usuario(?:\/|$)/.test(path)) {
    for (const row of Array.isArray(data) ? data : [data]) {
      if (row && typeof row === 'object') {
        assert.ok(!Object.hasOwn(row, 'SenhaHash'), `${method} ${path}: hash exposto`);
        assert.ok(!Object.hasOwn(row, 'password'), `${method} ${path}: senha exposta`);
      }
    }
  }
  return data;
}

async function login() {
  const result = await request('POST', '/auth/login', 200, credentials, null);
  assert.equal(typeof result?.access_token, 'string', 'Login deve retornar access_token');
  assert.equal(result.access_token.split('.').length, 3, 'Formato de JWT inesperado');
  accessToken = result.access_token;
}

function ok(message) {
  passed++;
  console.log(`OK ${message}`);
}

function matchesKeys(row, original, keys) {
  return row && keys.every(key => row[key] === original[key]);
}

function checkFields(row, input, map) {
  assert.ok(row && typeof row === 'object', 'Esperado um registro na resposta');
  for (const [field, value] of Object.entries(input)) {
    if (field === 'password') continue; // Verificada por login, nunca pela resposta do CRUD.
    // Prisma serializa Decimal como string; compara o valor numerico nesses campos.
    const actual = row[map[field]];
    if (['totalHoras', 'preco', 'valorPago'].includes(field)) {
      assert.equal(Number(actual), value, `Campo ${map[field]}`);
    } else {
      assert.equal(actual, value, `Campo ${map[field]}`);
    }
  }
}

try {
  assert.ok(adminToken, 'Defina ADMIN_TOKEN com um JWT de administrador.');
  const admin = await request('GET', '/auth/me', 200);
  assert.equal(admin.perfil, 'ADMINISTRADOR', 'O teste CRUD exige administrador.');
  console.log(`API: ${baseUrl}\nIdentificador desta execucao: ${token}`);
  assert.equal(await request('GET', '/', 200), 'Hello World!');
  ok('GET /');
  const document = await request('GET', '/api-json', 200);
  // Confere se todos os endpoints esperados aparecem no Swagger antes de gravar dados.
  for (const scenario of scenarios) {
    const listPath = `/${scenario.route}`;
    const itemPath = scenario.route === 'progresso-aula' ? `${listPath}/{idUsuario}/{idAula}`
      : scenario.route === 'trilha-curso' ? `${listPath}/{idTrilha}/{idCurso}` : `${listPath}/{id}`;
    for (const verb of ['post', 'get']) assert.ok(document.paths?.[listPath]?.[verb], `${verb} ${listPath} ausente no Swagger`);
    for (const verb of ['get', 'patch', 'delete']) assert.ok(document.paths?.[itemPath]?.[verb], `${verb} ${itemPath} ausente no Swagger`);
  }
  ok('Swagger: 70 endpoints CRUD documentados');
  assert.ok(document.paths?.['/auth/login']?.post, 'Login ausente no Swagger');
  assert.equal(document.components?.securitySchemes?.token?.scheme, 'bearer');
  ok('Swagger: login e autenticacao Bearer documentados');
  await request('POST', '/auth/login', 400, {}, null);
  ok('Login rejeita campos obrigatorios ausentes');
  await request('POST', '/auth/login', 401,
    { email: `inexistente-${token}@example.com`, password: 'teste123' }, null);
  ok('Login rejeita usuario inexistente');

  for (const scenario of scenarios) {
    const path = `/${scenario.route}`;
    await request('POST', path, 400, {});
    ok(`POST ${path}: rejeita campos obrigatorios ausentes`);

    const invalidPath = `${path}/${scenario.keys.map(() => 'abc').join('/')}`;
    for (const method of ['GET', 'PATCH', 'DELETE']) {
      await request(method, invalidPath, 400, method === 'PATCH' ? scenario.patch : undefined, adminToken);
    }
    await request('GET', path, 401, undefined, null);
    await request('GET', path, 401, undefined, 'token-invalido');
    const input = scenario.body();
    const created = await request('POST', path, 201, input, scenario.route === 'usuario' ? null : adminToken);
    for (const key of scenario.keys) assert.ok(Number.isInteger(created?.[key]), `${path}: ID ausente: ${key}`);
    const itemPath = `${path}/${scenario.keys.map(key => created[key]).join('/')}`;
    // Registra para limpeza antes das demais assercoes.
    cleanup.push({ scenario, created, itemPath });
    records[scenario.route] = created;
    checkFields(created, input, scenario.map);
    ok(`POST ${path}`);

    if (scenario.route === 'usuario') {
      credentials = { email: input.email, password: input.password };
      await login();
      ok('Login com senha cadastrada retorna JWT');
      await request('POST', path, 409, input, null);
      ok('Cadastro com e-mail duplicado retorna 409');
      await request('POST', '/auth/login', 401,
        { ...credentials, password: 'senha-incorreta' }, null);
      ok('Login rejeita senha incorreta');
      for (const bearer of [null, 'token-invalido']) {
        for (const [method, target, body] of [
          ['GET', path], ['GET', itemPath],
          ['PATCH', itemPath, { name: 'Nao deve alterar' }], ['DELETE', itemPath],
        ]) {
          await request(method, target, 401, body, bearer);
          ok(`${method} ${target}: rejeita ${bearer === null ? 'ausencia de token' : 'token invalido'}`);
        }
      }
    }

    const listed = await request('GET', path, 200);
    assert.ok(Array.isArray(listed), `${path}: esperado um array`);
    assert.ok(listed.some(row => matchesKeys(row, created, scenario.keys)), `${path}: registro criado nao encontrado na lista`);
    ok(`GET ${path}`);

    const found = await request('GET', itemPath, 200);
    assert.ok(matchesKeys(found, created, scenario.keys), `${itemPath}: registro incorreto`);
    checkFields(found, input, scenario.map);
    ok(`GET ${itemPath}`);

    const updated = await request('PATCH', itemPath, 200, scenario.patch);
    assert.ok(matchesKeys(updated, created, scenario.keys), `${itemPath}: IDs alterados`);
    checkFields(updated, { ...input, ...scenario.patch }, scenario.map);
    ok(`PATCH ${itemPath}: altera campos enviados e preserva os demais`);

    const persisted = await request('GET', itemPath, 200);
    checkFields(persisted, { ...input, ...scenario.patch }, scenario.map);
    ok(`GET ${itemPath}: atualizacao persistida`);
    if (scenario.route === 'usuario') {
      await login();
      ok('PATCH sem password preserva a senha existente');
      const oldPassword = credentials.password;
      const newPassword = 'novaSenha123';
      const changed = await request('PATCH', itemPath, 200, { password: newPassword });
      credentials.password = newPassword;
      assert.ok(matchesKeys(changed, created, scenario.keys));
      checkFields(changed, { ...input, ...scenario.patch }, scenario.map);
      ok('PATCH de senha preserva dados publicos e nao expoe hash');
      await request('POST', '/auth/login', 401,
        { ...credentials, password: oldPassword }, null);
      ok('Login rejeita a senha antiga apos a troca');
      await login();
      ok('Login aceita a nova senha e retorna JWT');
      const authenticated = await request('GET', itemPath, 200, undefined, accessToken);
      assert.ok(matchesKeys(authenticated, created, scenario.keys));
      ok('Novo JWT permite acessar rota protegida');
    }
  }
} catch (error) {
  failures++;
  console.error(`FALHA: ${error.message}`);
} finally {
  // Filhos antes dos pais, removendo somente os registros criados nesta execucao.
  for (const { scenario, created, itemPath } of cleanup.reverse()) {
    try {
      if (scenario.route === 'usuario' && !accessToken && credentials) await login();
      const deleted = await request('DELETE', itemPath, 200);
      assert.ok(matchesKeys(deleted, created, scenario.keys), `${itemPath}: registro excluido incorreto`);
      ok(`DELETE ${itemPath}`);
      // A chave recém-excluída garante ausência sem depender de um ID arbitrário.
      for (const method of ['GET', 'PATCH', 'DELETE']) {
        await request(method, itemPath, 404, method === 'PATCH' ? scenario.patch : undefined, adminToken);
      }
      const listed = await request('GET', `/${scenario.route}`, 200);
      assert.ok(Array.isArray(listed));
      assert.ok(!listed.some(row => matchesKeys(row, created, scenario.keys)), `${itemPath}: registro ainda existe`);
      ok(`GET /${scenario.route}: exclusao confirmada`);
    } catch (error) {
      failures++;
      console.error(`FALHA NA LIMPEZA ${itemPath}: ${error.message}`);
    }
  }
  console.log(`\nResultado: ${passed} verificacoes aprovadas; ${failures} falha(s).`);
  if (failures) console.error('A execucao foi incompleta. Corrija a causa e tente novamente; confira acima eventuais registros nao removidos.');
  process.exitCode = failures ? 1 : 0;
}
