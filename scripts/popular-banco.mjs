// Carga direta no PostgreSQL via Prisma. Nao usa HTTP, login ou token.
// Na raiz: node scripts/popular-banco.mjs
import { randomUUID, randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const argument = process.argv[2];
if (argument === '--help' || argument === '-h') {
  console.log('Uso: node scripts/popular-banco.mjs');
  console.log('Insere diretamente no PostgreSQL: 4 cursos, 10 alunos, 3 instrutores e 2 administradores.');
  console.log('Requer Docker, container api em execucao e migrations aplicadas. Nao exige login nem token.');
  console.log('Cada execucao adiciona um novo conjunto. Nao limpa dados existentes.');
  process.exit(0);
}
if (argument !== undefined && argument !== '--database-worker') {
  console.error('Este script nao recebe URL de API. Use: node scripts/popular-banco.mjs');
  process.exit(1);
}
// O host apenas encaminha este arquivo ao Node do container, sem instalar dependencias.
if (argument !== '--database-worker') {
  const result = spawnSync('docker', [
    'compose', 'exec', '-T', 'api', 'node', '--input-type=module', '-', '--database-worker',
  ], {
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    input: readFileSync(fileURLToPath(import.meta.url)),
    stdio: ['pipe', 'inherit', 'inherit'],
  });
  if (result.error) console.error(`Nao foi possivel executar o Docker: ${result.error.message}`);
  process.exit(result.status ?? 1);
}

const batch = randomUUID();
const label = `Demo ${batch}`;
const now = new Date().toISOString();
const later = new Date(Date.now() + 30 * 86400000).toISOString();
const created = [];
let prisma;
let bcrypt;
const models = {
  usuario: 'usuario', categoria: 'categoria', curso: 'curso', modulo: 'modulo',
  aula: 'aula', matricula: 'matricula', 'progresso-aula': 'progressoAula',
  avaliacao: 'avaliacao', trilha: 'trilha', 'trilha-curso': 'trilhaCurso',
  certificado: 'certificado', plano: 'plano', assinatura: 'assinatura', pagamento: 'pagamento',
};

// Converte os campos das fixtures nos nomes reais das colunas Prisma.
async function databaseData(resource, body) {
  if (resource === 'usuario') return {
    NomeCompleto: body.name, Email: body.email,
    SenhaHash: await bcrypt.hash(body.password, 10), Perfil: body.perfil,
  };
  return Object.fromEntries(Object.entries(body).map(([field, value]) => {
    const column = field === 'urlConteudo' ? 'URL_Conteudo'
      : field === 'idTransacaoGateway' ? 'Id_Transacao_Gateway'
      : field.startsWith('id') ? `ID_${field.slice(2)}`
      : field[0].toUpperCase() + field.slice(1);
    return [column, field.startsWith('data') && value != null ? new Date(value) : value];
  }));
}

async function create(resource, keys, body) {
  const model = models[resource];
  if (!model) throw new Error(`Modelo desconhecido: ${resource}`);
  const row = await prisma[model].create({
    data: await databaseData(resource, body),
    ...(resource === 'usuario' ? { omit: { SenhaHash: true } } : {}),
  });
  if (keys.some(key => !Number.isInteger(row?.[key]))) {
    throw new Error(`Identificador inesperado em ${resource}; confira o banco antes de repetir.`);
  }
  const identifier = `${resource}: ${keys.map(key => row[key]).join('/')}`;
  created.push(identifier);
  console.log(`Inserido: ${identifier}`);
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
  console.log(`Carga direta no PostgreSQL. Conjunto: ${batch}`);
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL nao definida no container.');
  const require = createRequire('/app/package.json');
  const { PrismaClient } = require('./dist/src/generated/prisma/client.js');
  const { PrismaPg } = require('@prisma/adapter-pg');
  bcrypt = require('bcrypt');
  prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  await prisma.$connect();
  // Confere se a migracao de perfis esta aplicada antes da primeira insercao.
  await prisma.usuario.findFirst({ select: { Perfil: true } });

  const accounts = [];
  async function account(name, prefix, number, perfil) {
    const email = `${prefix}${number}.${batch}@example.com`;
    const password = randomBytes(18).toString('base64url');
    const row = await create('usuario', ['ID_Usuario'], {
      name: `${name} (${label})`, email, password, perfil,
    });
    // Imprime logo apos criar, inclusive para diagnosticar uma carga parcial.
    console.log(`Conta criada: ${email} | Senha: ${password}`);
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
  console.error('A carga usa insercoes individuais, sem transacao global. Registros parciais foram mantidos.');
  console.error('Em caso de perda de conexao, a ultima insercao pode ter sido gravada. Confira antes de repetir.');
  console.error(`Identifique este conjunto por: ${batch}. Reexecutar cria outro conjunto.`);
  process.exitCode = 1;
}).finally(async () => {
  if (prisma) {
    try { await prisma.$disconnect(); }
    catch { console.error('Nao foi possivel encerrar a conexao com o banco.'); process.exitCode = 1; }
  }
});
