// Node.js 20+. ADMIN_TOKEN deve pertencer a um administrador existente.
// Cria fixtures proprias e tenta apaga-las ao terminar, sem alterar o administrador.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
const base = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '');
const admin = process.env.ADMIN_TOKEN;
const suffix = randomUUID();
const cleanup = [];
let checks = 0;

async function call(method, path, status, body, token = admin) {
  const response = await fetch(`${base}${path}`, {
    method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(15000),
  });
  const result = await response.json().catch(() => null);
  assert.equal(response.status, status, `${method} ${path}: ${JSON.stringify(result)}`);
  checks++;
  return result;
}
async function create(route, key, body, token = admin) {
  const row = await call('POST', `/${route}`, 201, body, token);
  cleanup.push(`/${route}/${row[key]}`);
  return row;
}
// Cria uma conta como aluno e promove via administrador, verificando o perfil com o token já emitido.
async function account(label, perfil) {
  const email = `${label}.${suffix}@example.com`;
  const password = `Teste-${suffix}`;
  const row = await create('usuario', 'ID_Usuario', { name: label, email, password }, null);
  assert.equal(row.Perfil, 'ALUNO', 'Cadastro publico nao pode elevar privilegios.');
  const login = await call('POST', '/auth/login', 200, { email, password }, null);
  if (perfil !== 'ALUNO') await call('PATCH', `/usuario/${row.ID_Usuario}/perfil`, 200, { perfil });
  const me = await call('GET', '/auth/me', 200, undefined, login.access_token);
  assert.equal(me.perfil, perfil, 'Token anterior a promocao deve refletir o banco.');
  return { id: row.ID_Usuario, token: login.access_token };
}
try {
  assert.ok(admin, 'Defina ADMIN_TOKEN.');
  const adminUser = await call('GET', '/auth/me', 200);
  assert.equal(adminUser.perfil, 'ADMINISTRADOR');
  await call('PATCH', `/usuario/${adminUser.userId}/perfil`, 403, { perfil: 'ALUNO' });
  await call('GET', '/curso', 401, undefined, null);
  const teacher = await account('instrutor', 'INSTRUTOR');
  const otherTeacher = await account('outro-instrutor', 'INSTRUTOR');
  const student = await account('aluno', 'ALUNO');
  const otherStudent = await account('outro-aluno', 'ALUNO');
  const registration = { name: 'Cadastro de teste', email: `cadastro.${suffix}@example.com`, password: `Teste-${suffix}` };
  for (const [index, token] of [student.token, teacher.token, 'token-invalido'].entries()) {
    await create('usuario', 'ID_Usuario', { ...registration, email: `publico.${index}.${suffix}@example.com` }, token);
  }
  const registered = await create('usuario', 'ID_Usuario', registration, admin);
  assert.equal(registered.Perfil, 'ALUNO', 'Perfil omitido deve assumir ALUNO.');
  for (const perfil of ['ALUNO', 'INSTRUTOR', 'ADMINISTRADOR']) {
    const body = { ...registration, email: `${perfil}.${suffix}@example.com`, perfil };
    const row = await create('usuario', 'ID_Usuario', body, null);
    assert.equal(row.Perfil, perfil);
    const login = await call('POST', '/auth/login', 200, { email: body.email, password: body.password }, null);
    const me = await call('GET', '/auth/me', 200, undefined, login.access_token);
    assert.equal(me.perfil, perfil);
  }
  for (const perfil of [null, 'INVALIDO']) {
    await call('POST', '/usuario', 400, { ...registration, perfil }, admin);
  }
  await call('PATCH', `/usuario/${student.id}/perfil`, 403, { perfil: 'ADMINISTRADOR' }, student.token);
  await call('GET', `/usuario/${otherStudent.id}`, 403, undefined, student.token);
  await call('PATCH', `/usuario/${otherStudent.id}`, 403, { name: 'Invadido' }, student.token);
  await call('POST', '/categoria', 403, { nome: suffix }, teacher.token);
  const category = await create('categoria', 'ID_Categoria', { nome: suffix });
  const courseBody = { titulo: 'Curso privado do instrutor', idCategoria: category.ID_Categoria, nivel: 'INICIANTE', totalAulas: 1, totalHoras: 1 };
  await call('POST', '/curso', 403, { ...courseBody, idInstrutor: student.id }, student.token);
  const course = await create('curso', 'ID_Curso', { ...courseBody, idInstrutor: teacher.id }, teacher.token);
  await call('POST', '/curso', 403, { ...courseBody, idInstrutor: otherTeacher.id }, teacher.token);
  const foreign = await create('curso', 'ID_Curso', { ...courseBody, idInstrutor: otherTeacher.id }, otherTeacher.token);
  await call('PATCH', `/curso/${foreign.ID_Curso}`, 403, { titulo: 'Invadido' }, teacher.token);
  await call('DELETE', `/curso/${foreign.ID_Curso}`, 403, undefined, teacher.token);
  const courses = await call('GET', '/curso', 200, undefined, teacher.token);
  assert.ok(courses.every(row => row.ID_Instrutor === teacher.id));
  const module = await create('modulo', 'ID_Modulo', { idCurso: course.ID_Curso, titulo: 'Modulo', ordem: 1 }, teacher.token);
  const foreignModule = await create('modulo', 'ID_Modulo', { idCurso: foreign.ID_Curso, titulo: 'Outro modulo', ordem: 1 }, otherTeacher.token);
  await call('PATCH', `/modulo/${module.ID_Modulo}`, 403, { idCurso: foreign.ID_Curso }, teacher.token);
  const lesson = await create('aula', 'ID_Aula', { idModulo: module.ID_Modulo, titulo: 'Aula', tipoConteudo: 'TEXTO', ordem: 1 }, teacher.token);
  await call('PATCH', `/aula/${lesson.ID_Aula}`, 403, { idModulo: foreignModule.ID_Modulo }, teacher.token);
  await call('GET', `/aula/${lesson.ID_Aula}`, 403, undefined, student.token);
  await call('POST', '/matricula', 403, { idUsuario: otherStudent.id, idCurso: course.ID_Curso }, student.token);
  await create('matricula', 'ID_Matricula', { idUsuario: student.id, idCurso: course.ID_Curso }, student.token);
  await call('POST', '/matricula', 409, { idUsuario: student.id, idCurso: course.ID_Curso }, student.token);
  await call('DELETE', `/curso/${course.ID_Curso}`, 409, undefined, admin);
  await call('GET', `/aula/${lesson.ID_Aula}`, 200, undefined, student.token);
  await call('GET', `/aula/${lesson.ID_Aula}`, 403, undefined, otherStudent.token);
  await call('POST', '/progresso-aula', 403, { idUsuario: otherStudent.id, idAula: lesson.ID_Aula, status: 'CONCLUIDO' }, otherStudent.token);
  await call('POST', '/progresso-aula', 201, { idUsuario: student.id, idAula: lesson.ID_Aula, status: 'CONCLUIDO' }, student.token);
  const progressPath = `/progresso-aula/${student.id}/${lesson.ID_Aula}`;
  cleanup.push(progressPath);
  await call('DELETE', progressPath, 403, undefined, otherStudent.token);
  assert.deepEqual(await call('GET', '/progresso-aula', 200, undefined, otherStudent.token), []);
  assert.ok((await call('GET', '/usuario', 200, undefined, student.token)).every(row => row.ID_Usuario === student.id && !('SenhaHash' in row)));
  for (const route of ['certificado', 'pagamento', 'assinatura', 'plano']) await call('POST', `/${route}`, 403, {}, student.token);
  const plan = await create('plano', 'ID_Plano', { nome: suffix, preco: 19.9, duracaoMeses: 1 });
  const subscription = await create('assinatura', 'ID_Assinatura', { idUsuario: student.id, idPlano: plan.ID_Plano, dataInicio: new Date().toISOString(), dataFim: new Date(Date.now() + 86400000).toISOString() });
  const payment = await create('pagamento', 'ID_Pagamento', { idAssinatura: subscription.ID_Assinatura, valorPago: 19.9, dataPagamento: new Date().toISOString(), metodoPagamento: 'PIX', idTransacaoGateway: suffix });
  await call('GET', `/pagamento/${payment.ID_Pagamento}`, 200, undefined, student.token);
  await call('GET', `/pagamento/${payment.ID_Pagamento}`, 403, undefined, otherStudent.token);
  assert.deepEqual(await call('GET', '/pagamento', 200, undefined, otherStudent.token), []);
  await call('PATCH', `/usuario/${teacher.id}/perfil`, 200, { perfil: 'ALUNO' });
  await call('POST', '/curso', 403, { ...courseBody, idInstrutor: teacher.id }, teacher.token);
  console.log(`Permissoes: ${checks} respostas verificadas e escopos conferidos.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  // Remove primeiro os registros dependentes para respeitar as chaves estrangeiras.
  for (const path of cleanup.reverse()) {
    try { await call('DELETE', path, 200); }
    catch (error) { console.error(`Falha na limpeza ${path}: ${error.message}`); process.exitCode = 1; }
  }
  console.log(`Conjunto de teste: ${suffix}. Confira eventuais falhas de limpeza acima.`);
}
