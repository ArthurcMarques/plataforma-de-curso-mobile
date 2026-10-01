// Node.js 20+. Execute na raiz: node scripts/popular-banco.mjs [URL_DA_API]
// Adiciona um conjunto independente por execucao. Nao limpa dados existentes.
import { randomUUID, randomBytes } from 'node:crypto';

const argument = process.argv[2];
if (argument === '--help' || argument === '-h') {
  console.log('Uso: node scripts/popular-banco.mjs [http://localhost:3000]');
  console.log('Cria dados de demonstracao nas 14 tabelas pela API. Cada execucao adiciona um novo conjunto.');
  console.log('A API e as migrations precisam estar prontas. Nao executa limpeza.');
  process.exit(0);
}
const baseUrl = new URL(argument ?? 'http://localhost:3000');
if (!['http:', 'https:'].includes(baseUrl.protocol) || baseUrl.username || baseUrl.password || baseUrl.search || baseUrl.hash) {
  throw new Error('Informe uma URL HTTP(S) da API sem credenciais, query ou fragmento.');
}
const base = baseUrl.href.replace(/\/$/, '');
const batch = randomUUID();
const label = `Demo ${batch}`;
const password = randomBytes(18).toString('base64url');
const instructorEmail = `instrutor.${batch}@example.com`;
const studentEmail = `aluno.${batch}@example.com`;
const now = new Date().toISOString();
const later = new Date(Date.now() + 30 * 86400000).toISOString();
const created = [];
let token;

async function request(method, path, body) {
  let response;
  try {
    response = await fetch(`${base}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new Error(`${method} ${path}: conexao indisponivel ou timeout. Confira a API.`);
  }
  const bodyText = await response.text();
  let result;
  try { result = JSON.parse(bodyText); } catch { result = bodyText; }
  if (!response.ok) {
    const message = result?.message;
    throw new Error(`${method} ${path}: HTTP ${response.status}${message ? ` - ${[].concat(message).join('; ')}` : ''}`);
  }
  return result;
}

async function create(route, keys, body) {
  const row = await request('POST', `/${route}`, body);
  if (keys.some(key => !Number.isInteger(row?.[key]))) {
    throw new Error(`Resposta inesperada de /${route}; confira o banco antes de repetir.`);
  }
  const path = `/${route}/${keys.map(key => row[key]).join('/')}`;
  created.push(path);
  console.log(`Criado: ${path}`);
  return row;
}

async function main() {
  console.log(`API: ${base}\nConjunto: ${batch}`);
  await request('GET', '/');
  if (!process.env.ADMIN_TOKEN) throw new Error('Defina ADMIN_TOKEN com um JWT de administrador antes de popular.');
  token = process.env.ADMIN_TOKEN;
  const admin = await request('GET', '/auth/me');
  if (admin.perfil !== 'ADMINISTRADOR') throw new Error('A carga exige um administrador.');
  // Credenciais sao novas a cada execucao e permitem entrar pelo frontend.
  console.log(`Login do instrutor: ${instructorEmail}`);
  console.log(`Login do aluno: ${studentEmail}`);
  console.log(`Senha dos dois usuarios deste conjunto: ${password}`);
  const instructor = await create('usuario', ['ID_Usuario'], {
    name: `Marina Oliveira (${label})`, email: instructorEmail, password,
  });
  await request('PATCH', `/usuario/${instructor.ID_Usuario}/perfil`, { perfil: 'INSTRUTOR' });
  const student = await create('usuario', ['ID_Usuario'], {
    name: `Lucas Santos (${label})`, email: studentEmail, password,
  });
  const category = await create('categoria', ['ID_Categoria'], {
    nome: `Desenvolvimento Web (${label})`, descricao: 'Cursos de frontend e backend para demonstracao.',
  });
  const track = await create('trilha', ['ID_Trilha'], {
    titulo: `Desenvolvimento Full Stack (${label})`, descricao: 'Fundamentos de React e NestJS.',
    idCategoria: category.ID_Categoria,
  });
  const courses = [];
  for (const [index, topic] of ['React', 'NestJS'].entries()) {
    const course = await create('curso', ['ID_Curso'], {
      titulo: `${topic} na pratica (${label})`, descricao: `Introducao ao desenvolvimento com ${topic}.`,
      idInstrutor: instructor.ID_Usuario, idCategoria: category.ID_Categoria,
      nivel: index === 0 ? 'INICIANTE' : 'INTERMEDIARIO', dataPublicacao: now,
      totalAulas: 3, totalHoras: 1,
    });
    courses.push(course);
    const module = await create('modulo', ['ID_Modulo'], {
      idCurso: course.ID_Curso, titulo: `Fundamentos de ${topic}`, ordem: 1,
    });
    for (const [lessonIndex, type] of ['VIDEO', 'TEXTO', 'QUIZ'].entries()) {
      const lesson = await create('aula', ['ID_Aula'], {
        idModulo: module.ID_Modulo, titulo: ['Introducao', 'Conceitos principais', 'Revisao'][lessonIndex],
        tipoConteudo: type, urlConteudo: `https://example.com/demo/${topic.toLowerCase()}/${lessonIndex + 1}`,
        duracaoMinutos: 20, ordem: lessonIndex + 1,
      });
      // Primeiro curso completo; segundo curso ainda em andamento.
      if (index === 0 || lessonIndex === 0) {
        await create('progresso-aula', ['ID_Usuario', 'ID_Aula'], {
          idUsuario: student.ID_Usuario, idAula: lesson.ID_Aula, status: 'CONCLUIDO', dataConclusao: now,
        });
      }
    }
    await create('matricula', ['ID_Matricula'], {
      idUsuario: student.ID_Usuario, idCurso: course.ID_Curso,
      ...(index === 0 ? { dataConclusao: now } : {}),
    });
    await create('trilha-curso', ['ID_Trilha', 'ID_Curso'], {
      idTrilha: track.ID_Trilha, idCurso: course.ID_Curso, ordem: index + 1,
    });
    await create('avaliacao', ['ID_Avaliacao'], {
      idUsuario: student.ID_Usuario, idCurso: course.ID_Curso, nota: index === 0 ? 5 : 4,
      comentario: 'Exemplo de avaliacao: aulas claras e exercicios praticos.',
    });
  }
  await create('certificado', ['ID_Certificado'], {
    idUsuario: student.ID_Usuario, idCurso: courses[0].ID_Curso,
    codigoVerificacao: `DEMO-${batch}`,
  });
  const plan = await create('plano', ['ID_Plano'], {
    nome: `Mensal (${label})`, descricao: 'Acesso aos cursos de demonstracao.', preco: 49.9, duracaoMeses: 1,
  });
  const subscription = await create('assinatura', ['ID_Assinatura'], {
    idUsuario: student.ID_Usuario, idPlano: plan.ID_Plano, dataInicio: now, dataFim: later,
  });
  await create('pagamento', ['ID_Pagamento'], {
    idAssinatura: subscription.ID_Assinatura, valorPago: 49.9, dataPagamento: now,
    metodoPagamento: 'PIX', idTransacaoGateway: `DEMO-${batch}`,
  });
  console.log(`\nConcluido: ${created.length} registros criados nas 14 tabelas.`);
  console.log('Os dados foram mantidos no banco. Atualize o frontend ou consulte pelo pgAdmin.');
  console.log('O instrutor acessa a area de cursos; o aluno acessa suas matriculas e progresso.');
}

main().catch(error => {
  console.error(`\nCarga interrompida: ${error.message}`);
  console.error(`${created.length} criacoes confirmadas. Os registros anteriores nao foram alterados.`);
  console.error('A carga usa requisicoes separadas, sem transacao global. Registros parciais foram mantidos.');
  console.error('Em caso de timeout, a ultima requisicao pode ter sido gravada. Confira antes de repetir.');
  console.error(`Identifique este conjunto por: ${batch}. Reexecutar cria outro conjunto.`);
  process.exitCode = 1;
});
