// Política central de autorização: limita leituras no banco e valida a propriedade dos vínculos nas escritas.
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { SessionUser } from './session-user';

// Relaciona cada rota ao delegate Prisma e aos campos que identificam registros simples ou compostos.
const resources: Record<string, { model: string; keys: string[] }> = {
  usuario: { model: 'usuario', keys: ['ID_Usuario'] },
  categoria: { model: 'categoria', keys: ['ID_Categoria'] },
  curso: { model: 'curso', keys: ['ID_Curso'] },
  modulo: { model: 'modulo', keys: ['ID_Modulo'] },
  aula: { model: 'aula', keys: ['ID_Aula'] },
  matricula: { model: 'matricula', keys: ['ID_Matricula'] },
  'progresso-aula': { model: 'progressoAula', keys: ['ID_Usuario', 'ID_Aula'] },
  avaliacao: { model: 'avaliacao', keys: ['ID_Avaliacao'] },
  trilha: { model: 'trilha', keys: ['ID_Trilha'] },
  'trilha-curso': { model: 'trilhaCurso', keys: ['ID_Trilha', 'ID_Curso'] },
  certificado: { model: 'certificado', keys: ['ID_Certificado'] },
  plano: { model: 'plano', keys: ['ID_Plano'] },
  assinatura: { model: 'assinatura', keys: ['ID_Assinatura'] },
  pagamento: { model: 'pagamento', keys: ['ID_Pagamento'] },
  notificacao: { model: 'notificacao', keys: ['ID_Notificacao'] },
};

@Injectable()
export class AccessPolicyService {
  constructor(private readonly prisma: PrismaService) {}

  // Valida IDs antes da conversão numérica feita pelos controllers do tutorial.
  validateParams(resource: string, params: Record<string, string>) {
    const config = resources[resource];
    if (!config) throw new ForbiddenException('Recurso sem política de acesso.');
    if (Object.keys(params).length) this.keyWhere(config.keys, params);
  }

  private delegate(resource: string): any {
    const config = resources[resource];
    if (!config) throw new ForbiddenException('Recurso sem politica de acesso.');
    return this.prisma[config.model];
  }

  // Retorna filtros Prisma, e não resultados: a restrição de acesso é aplicada dentro da consulta ao banco.
  scope(resource: string, user: SessionUser): Record<string, any> {
    if (!resources[resource]) throw new ForbiddenException();
    if (user.perfil === 'ADMINISTRADOR') return {};
    const own = { ID_Usuario: user.userId };
    // Instrutores acessam seus cursos; alunos acessam conteúdos dos cursos em que estão matriculados.
    const course = user.perfil === 'INSTRUTOR'
      ? { ID_Instrutor: user.userId }
      : { matriculas: { some: own } };
    switch (resource) {
      case 'usuario': return user.perfil === 'INSTRUTOR'
        ? { OR: [own, { matriculas: { some: { curso: { ID_Instrutor: user.userId } } } }] }
        : own;
      case 'categoria': case 'trilha': case 'trilha-curso': case 'plano': return {};
      case 'curso': return user.perfil === 'INSTRUTOR' ? course : {};
      case 'modulo': return { curso: course };
      case 'aula': return { modulo: { curso: course } };
      case 'matricula': case 'avaliacao': case 'certificado':
        return user.perfil === 'INSTRUTOR' ? { curso: course } : own;
      case 'progresso-aula': return user.perfil === 'INSTRUTOR' ? { aula: { modulo: { curso: course } } } : own;
      case 'assinatura': return own;
      case 'pagamento': return { assinatura: own };
      case 'notificacao': return own;
      default: throw new ForbiddenException();
    }
  }

  // Mantém as listas filtradas e distingue registro inexistente (404) de acesso proibido (403).
  async read(resource: string, user: SessionUser, params: Record<string, string>) {
    const config = resources[resource];
    const where = this.scope(resource, user);
    const options = resource === 'usuario' ? { omit: { SenhaHash: true } } : {};
    if (Object.keys(params).length === 0) return this.delegate(resource).findMany({ where, ...options });
    const keyWhere = this.keyWhere(config.keys, params);
    const row = await this.delegate(resource).findFirst({ where: { AND: [where, keyWhere] }, ...options });
    if (!row) {
      // A consulta extra verifica somente a chave, sem carregar dados privados.
      const exists = await this.delegate(resource).findFirst({
        where: keyWhere, select: Object.fromEntries(config.keys.map(key => [key, true])),
      });
      if (exists) throw new ForbiddenException('Você não tem permissão para acessar este registro.');
      throw new NotFoundException('Registro não encontrado.');
    }
    return row;
  }

  // Converte os parâmetros de rota em chaves numéricas, inclusive pares como usuário/aula.
  private keyWhere(keys: string[], params: Record<string, string>) {
    return Object.fromEntries(keys.map(key => {
      const param = keys.length === 1 ? 'id' : `id${key.slice(3)}`;
      const value = Number(params[param]);
      if (!/^\d+$/.test(params[param] ?? '') || !Number.isSafeInteger(value) || value <= 0 || value > 2147483647) throw new BadRequestException('ID invalido.');
      return [key, value];
    }));
  }

  private async ownsCourse(id: unknown, user: SessionUser) {
    if (!Number.isInteger(id)) throw new BadRequestException('idCurso deve ser inteiro.');
    const course = await this.prisma.curso.findUnique({
      where: { ID_Curso: id as number }, select: { ID_Instrutor: true },
    });
    if (!course) throw new BadRequestException('O curso informado não existe.');
    if (course.ID_Instrutor !== user.userId) throw new ForbiddenException('Curso de outro instrutor.');
  }

  private async ownsSubscription(id: unknown, user: SessionUser) {
    if (!Number.isInteger(id)) throw new BadRequestException('idAssinatura deve ser inteiro.');
    const subscription = await this.prisma.assinatura.findUnique({
      where: { ID_Assinatura: id as number }, select: { ID_Usuario: true },
    });
    if (!subscription) throw new BadRequestException('A assinatura informada não existe.');
    if (subscription.ID_Usuario !== user.userId) throw new ForbiddenException('Assinatura de outro usuário.');
  }

  private async enrolled(id: unknown, user: SessionUser) {
    if (!Number.isInteger(id)) throw new BadRequestException('idCurso deve ser inteiro.');
    const course = await this.prisma.curso.findUnique({ where: { ID_Curso: id as number }, select: { ID_Curso: true } });
    if (!course) throw new BadRequestException('O curso informado não existe.');
    const row = await this.prisma.matricula.findFirst({ where: { ID_Curso: id as number, ID_Usuario: user.userId } });
    if (!row) throw new ForbiddenException('Matricule-se no curso para acessar este recurso.');
  }

  // Valida tanto o registro atual quanto o destino dos vínculos enviados em POST/PATCH.
  async authorizeWrite(resource: string, method: string, params: Record<string, string>, body: Record<string, any>, user: SessionUser, handler: string) {
    if (!resources[resource]) throw new ForbiddenException();
    this.validateParams(resource, params);
    for (const field of ['idUsuario', 'idCurso', 'idInstrutor', 'idCategoria', 'idModulo', 'idAula', 'idPlano', 'idAssinatura', 'idTrilha']) {
      if (!(field in body) || (field === 'idTrilha' && body[field] === null && resource === 'certificado')) continue;
      if (!Number.isSafeInteger(body[field]) || body[field] <= 0 || body[field] > 2147483647) {
        throw new BadRequestException(`${field} deve ser um inteiro positivo válido.`);
      }
    }
    // Mudança de perfil usa uma operação separada; o administrador não pode rebaixar a própria conta.
    if (handler === 'updatePerfil') {
      if (user.perfil !== 'ADMINISTRADOR' || Number(params.id) === user.userId) {
        throw new ForbiddenException('Somente administradores podem alterar o perfil de outros usuarios.');
      }
      return;
    }
    if (user.perfil === 'ADMINISTRADOR') {
      if (resource === 'usuario' && method === 'DELETE' && Number(params.id) === user.userId) throw new ForbiddenException('Nao exclua sua propria conta administrativa.');
      return;
    }
    if (resource === 'usuario' && method === 'PATCH' && Number(params.id) === user.userId) {
      if ('perfil' in body || 'Perfil' in body) throw new ForbiddenException('Perfil exige administrador.');
      return;
    }
    // A lista de operações é explícita: recursos não previstos ficam bloqueados para perfis comuns.
    const instructorWrite = user.perfil === 'INSTRUTOR' && ['curso', 'modulo', 'aula'].includes(resource);
    const studentWrite = user.perfil === 'ALUNO' && (
      (resource === 'matricula' && method === 'POST') ||
      (resource === 'progresso-aula' && ['POST', 'DELETE'].includes(method)) ||
      (resource === 'avaliacao' && ['POST', 'PATCH', 'DELETE'].includes(method)) ||
      (resource === 'assinatura' && method === 'POST') ||
      (resource === 'pagamento' && method === 'POST')
    );
    if (!instructorWrite && !studentWrite) throw new ForbiddenException('Seu perfil nao permite esta operacao.');
    let existing: Record<string, any> | undefined;
    // Antes de editar ou excluir, confirma que o registro existente pertence ao escopo do usuário.
    if (method !== 'POST') existing = await this.read(resource, user, params);
    if (method === 'DELETE') return;
    // Também verifica o novo curso/módulo para impedir transferir um registro para outro instrutor.
    if (instructorWrite) {
      if (resource === 'curso' && (body.idInstrutor ?? existing?.ID_Instrutor) !== user.userId) throw new ForbiddenException('O instrutor deve ser o usuario autenticado.');
      if (resource === 'modulo') await this.ownsCourse(body.idCurso ?? existing?.ID_Curso, user);
      if (resource === 'aula') {
        const idModulo = body.idModulo ?? existing?.ID_Modulo;
        if (!Number.isInteger(idModulo)) throw new BadRequestException('idModulo deve ser inteiro.');
        const module = await this.prisma.modulo.findUnique({ where: { ID_Modulo: idModulo } });
        if (!module) throw new BadRequestException('O módulo informado não existe.');
        await this.ownsCourse(module.ID_Curso, user);
      }
      return;
    }
    // O aluno só pode criar ou alterar vínculos em seu próprio nome; pagamento não tem idUsuario direto, valida pela assinatura.
    if (resource !== 'pagamento' && (body.idUsuario ?? existing?.ID_Usuario) !== user.userId) throw new ForbiddenException('Nao e permitido agir em nome de outro aluno.');
    if (resource === 'pagamento') await this.ownsSubscription(body.idAssinatura, user);
    if (resource === 'matricula') {
      if (body.dataConclusao != null) throw new ForbiddenException('Conclusao da matricula exige administrador.');
      if (!Number.isInteger(body.idCurso)) throw new BadRequestException('idCurso deve ser inteiro.');
      const duplicate = await this.prisma.matricula.findFirst({ where: { ID_Usuario: user.userId, ID_Curso: body.idCurso } });
      if (duplicate) throw new ConflictException('Voce ja esta matriculado neste curso.');
    }
    if (resource === 'avaliacao') await this.enrolled(body.idCurso ?? existing?.ID_Curso, user);
    if (resource === 'progresso-aula') {
      if (!Number.isInteger(body.idAula)) throw new BadRequestException('idAula deve ser inteiro.');
      const lesson = await this.prisma.aula.findUnique({ where: { ID_Aula: body.idAula }, include: { modulo: true } });
      if (!lesson) throw new BadRequestException('A aula informada não existe.');
      await this.enrolled(lesson.modulo.ID_Curso, user);
    }
  }
}
