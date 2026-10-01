// Node.js 20+. Execute na raiz: node scripts/popular-banco.mjs [URL_DA_API]
// Adiciona um conjunto independente por execucao. Nao limpa dados existentes.
import { randomUUID, randomBytes } from 'node:crypto';

const argument = process.argv[2];
if (argument === '--help' || argument === '-h') {
  console.log('Uso: node scripts/popular-banco.mjs [http://localhost:3000]');
  console.log('Cria dados de demonstracao nas 14 tabelas pela API. Cada execucao adiciona um novo conjunto.');
  console.log('Cria 4 cursos (3 modulos e 9 aulas cada), 10 alunos, 3 instrutores e 2 novos administradores.');
  console.log('Requer API, migrations e ADMIN_TOKEN de administrador. Nao executa limpeza.');
  process.exit(0);
}
const baseUrl = new URL(argument ?? 'http://localhost:3000');
if (!['http:', 'https:'].includes(baseUrl.protocol) || baseUrl.username || baseUrl.password || baseUrl.search || baseUrl.hash) {
  throw new Error('Informe uma URL HTTP(S) da API sem credenciais, query ou fragmento.');
}
const base = baseUrl.href.replace(/\/$/, '');
const batch = randomUUID();
const label = `Demo ${batch}`;
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

// Cada curso tem tres modulos com video, texto e quiz (9 aulas / 3 horas).
const curriculum = [
  { topic: 'HTML e CSS', slug: 'html-css', level: 'INICIANTE', modules: [
    ['Estrutura da Web', 'HTML semantico', 'Formularios acessiveis', 'Revisao de HTML'],
    ['Estilizacao', 'Seletores e cascata', 'Box model e tipografia', 'Revisao de CSS'],
    ['Projeto responsivo', 'Flexbox e Grid', 'Layout para dispositivos moveis', 'Desafio de pagina responsiva'],
  ] },
  { topic: 'JavaScript', slug: 'javascript', level: 'INICIANTE', modules: [
    ['Fundamentos', 'Variaveis e tipos', 'Funcoes e objetos', 'Revisao da linguagem'],
    ['Interfaces interativas', 'DOM e eventos', 'Validacao de formularios', 'Desafio de interatividade'],
    ['Programacao assincrona', 'Promises e async/await', 'Consumo de APIs com fetch', 'Projeto de catalogo'],
  ] },
  { topic: 'React', slug: 'react', level: 'INTERMEDIARIO', modules: [
    ['Componentes', 'JSX e propriedades', 'Composicao de componentes', 'Revisao de componentes'],
    ['Estado e efeitos', 'useState e formularios', 'useEffect e requisicoes', 'Desafio de estado'],
    ['Aplicacao completa', 'Rotas e navegacao', 'Integracao com API', 'Projeto de painel'],
  ] },
  { topic: 'NestJS', slug: 'nestjs', level: 'AVANCADO', modules: [
    ['Arquitetura', 'Modulos e injecao de dependencias', 'Controllers e services', 'Revisao da arquitetura'],
    ['Persistencia', 'Prisma e PostgreSQL', 'DTOs e validacao', 'Desafio de CRUD'],
    ['Seguranca e entrega', 'Autenticacao JWT', 'Permissoes e Docker', 'Projeto de API'],
  ] },
];

async function main() {
  console.log(`API: ${base}\nConjunto: ${batch}`);
  await request('GET', '/');
  if (!process.env.ADMIN_TOKEN) throw new Error('Defina ADMIN_TOKEN com um JWT de administrador antes de popular.');
  token = process.env.ADMIN_TOKEN;
  const admin = await request('GET', '/auth/me');
  if (admin.perfil !== 'ADMINISTRADOR') throw new Error('A carga exige um administrador.');

  const accounts = [];
  async function account(name, prefix, number, perfil) {
    const email = `${prefix}${number}.${batch}@example.com`;
    const password = randomBytes(18).toString('base64url');
    const row = await create('usuario', ['ID_Usuario'], {
      name: `${name} (${label})`, email, password,
    });
    // Imprime logo apos criar, inclusive para diagnosticar uma carga parcial.
    console.log(`Conta criada: ${email} | Senha: ${password}`);
    if (perfil !== 'ALUNO') {
      const promoted = await request('PATCH', `/usuario/${row.ID_Usuario}/perfil`, { perfil });
      if (promoted.Perfil !== perfil) throw new Error(`Perfil incorreto para ${email}.`);
    }
    accounts.push({ perfil, email, password });
    return row;
  }
  const students = [];
  const instructors = [];
  const administrators = [];
  const studentNames = ['Lucas Santos', 'Ana Souza', 'Bruno Lima', 'Carla Dias', 'Diego Alves',
    'Elisa Rocha', 'Felipe Costa', 'Gabriela Melo', 'Henrique Silva', 'Isabela Martins'];
  for (const [index, name] of studentNames.entries()) students.push(await account(name, 'aluno', index + 1, 'ALUNO'));
  for (const [index, name] of ['Marina Oliveira', 'Rafael Almeida', 'Beatriz Ferreira'].entries()) {
    instructors.push(await account(name, 'instrutor', index + 1, 'INSTRUTOR'));
  }
  for (const [index, name] of ['Clara Mendes', 'Pedro Ribeiro'].entries()) {
    administrators.push(await account(name, 'admin', index + 1, 'ADMINISTRADOR'));
  }

  const category = await create('categoria', ['ID_Categoria'], {
    nome: `Desenvolvimento Web (${label})`, descricao: 'Formacao do HTML ao backend com NestJS.',
  });
  const track = await create('trilha', ['ID_Trilha'], {
    titulo: `Desenvolvimento Full Stack (${label})`, descricao: 'HTML, CSS, JavaScript, React e NestJS.',
    idCategoria: category.ID_Categoria,
  });
  const courses = [];
  for (const [courseIndex, definition] of curriculum.entries()) {
    const course = await create('curso', ['ID_Curso'], {
      titulo: `${definition.topic} na pratica (${label})`, descricao: `Formacao em ${definition.topic}: fundamentos, pratica e projeto final.`,
      idInstrutor: instructors[courseIndex % instructors.length].ID_Usuario,
      idCategoria: category.ID_Categoria, nivel: definition.level, dataPublicacao: now,
      totalAulas: definition.modules.length * 3, totalHoras: definition.modules.length,
    });
    const lessons = [];
    for (const [moduleIndex, [title, ...titles]] of definition.modules.entries()) {
      const module = await create('modulo', ['ID_Modulo'], { idCurso: course.ID_Curso, titulo: title, ordem: moduleIndex + 1 });
      for (const [lessonIndex, type] of ['VIDEO', 'TEXTO', 'QUIZ'].entries()) {
        lessons.push(await create('aula', ['ID_Aula'], {
          idModulo: module.ID_Modulo, titulo: titles[lessonIndex], tipoConteudo: type,
          urlConteudo: `https://example.com/demo/${definition.slug}/${moduleIndex + 1}/${lessonIndex + 1}`,
          duracaoMinutos: [20, 25, 15][lessonIndex], ordem: lessonIndex + 1,
        }));
      }
    }
    courses.push(course);
    await create('trilha-curso', ['ID_Trilha', 'ID_Curso'], {
      idTrilha: track.ID_Trilha, idCurso: course.ID_Curso, ordem: courseIndex + 1,
    });

    for (const [studentIndex, student] of students.entries()) {
      // Cada curso possui alunos com 100%, 33% e 67% de progresso.
      const stage = (studentIndex + courseIndex) % 3;
      const completed = stage === 0;
      const completedLessons = completed ? lessons.length : stage * 3;
      await create('matricula', ['ID_Matricula'], {
        idUsuario: student.ID_Usuario, idCurso: course.ID_Curso,
        ...(completed ? { dataConclusao: now } : {}),
      });
      for (const lesson of lessons.slice(0, completedLessons)) {
        await create('progresso-aula', ['ID_Usuario', 'ID_Aula'], {
          idUsuario: student.ID_Usuario, idAula: lesson.ID_Aula, status: 'CONCLUIDO', dataConclusao: now,
        });
      }
      await create('avaliacao', ['ID_Avaliacao'], {
        idUsuario: student.ID_Usuario, idCurso: course.ID_Curso, nota: completed ? 5 : 4,
        comentario: completed ? 'Conclui o curso e pratiquei todos os modulos.' : 'Estou estudando e gostando dos exemplos.',
      });
      if (completed) {
        await create('certificado', ['ID_Certificado'], {
          idUsuario: student.ID_Usuario, idCurso: course.ID_Curso,
          codigoVerificacao: `DEMO-${batch}-${courseIndex + 1}-${studentIndex + 1}`,
        });
      }
    }
  }
  const plan = await create('plano', ['ID_Plano'], {
    nome: `Mensal (${label})`, descricao: 'Acesso aos quatro cursos de demonstracao.', preco: 49.9, duracaoMeses: 1,
  });
  for (const [index, student] of students.entries()) {
    const subscription = await create('assinatura', ['ID_Assinatura'], {
      idUsuario: student.ID_Usuario, idPlano: plan.ID_Plano, dataInicio: now, dataFim: later,
    });
    await create('pagamento', ['ID_Pagamento'], {
      idAssinatura: subscription.ID_Assinatura, valorPago: 49.9, dataPagamento: now,
      metodoPagamento: ['PIX', 'CARTAO', 'BOLETO'][index % 3], idTransacaoGateway: `DEMO-${batch}-${index + 1}`,
    });
  }
  console.log(`\nConcluido: ${created.length} registros criados nas 14 tabelas.`);
  console.log(`${courses.length} cursos completos, ${students.length} alunos, ${instructors.length} instrutores e ${administrators.length} novos administradores.`);
  console.table(accounts);
  console.log('Cada curso tem 3 modulos, 9 aulas e 3 horas. Links de conteudo e pagamentos sao ficticios.');
  console.log('Os dados foram mantidos no banco. Atualize o frontend ou consulte pelo pgAdmin.');
}

main().catch(error => {
  console.error(`\nCarga interrompida: ${error.message}`);
  console.error(`${created.length} criacoes confirmadas. Os registros anteriores nao foram alterados.`);
  console.error('A carga usa requisicoes separadas, sem transacao global. Registros parciais foram mantidos.');
  console.error('Em caso de timeout, a ultima requisicao pode ter sido gravada. Confira antes de repetir.');
  console.error(`Identifique este conjunto por: ${batch}. Reexecutar cria outro conjunto.`);
  process.exitCode = 1;
});
