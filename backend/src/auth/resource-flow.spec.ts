import { AssinaturaModule } from '../assinatura/assinatura.module';
import { AssinaturaController } from '../assinatura/assinatura.controller';
import { AulaModule } from '../aula/aula.module';
import { AulaController } from '../aula/aula.controller';
import { AvaliacaoModule } from '../avaliacao/avaliacao.module';
import { AvaliacaoController } from '../avaliacao/avaliacao.controller';
import { CategoriaModule } from '../categoria/categoria.module';
import { CategoriaController } from '../categoria/categoria.controller';
import { CertificadoModule } from '../certificado/certificado.module';
import { CertificadoController } from '../certificado/certificado.controller';
import { CursoModule } from '../curso/curso.module';
import { CursoController } from '../curso/curso.controller';
import { MatriculaModule } from '../matricula/matricula.module';
import { MatriculaController } from '../matricula/matricula.controller';
import { ModuloModule } from '../modulo/modulo.module';
import { ModuloController } from '../modulo/modulo.controller';
import { PagamentoModule } from '../pagamento/pagamento.module';
import { PagamentoController } from '../pagamento/pagamento.controller';
import { PlanoModule } from '../plano/plano.module';
import { PlanoController } from '../plano/plano.controller';
import { ProgressoAulaModule } from '../progresso-aula/progresso-aula.module';
import { ProgressoAulaController } from '../progresso-aula/progresso-aula.controller';
import { TrilhaModule } from '../trilha/trilha.module';
import { TrilhaController } from '../trilha/trilha.controller';
import { TrilhaCursoModule } from '../trilha-curso/trilha-curso.module';
import { TrilhaCursoController } from '../trilha-curso/trilha-curso.controller';
import { UsuarioModule } from '../usuario/usuario.module';
import { UsuarioController } from '../usuario/usuario.controller';

import { ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedRequest } from './session-user';

const cases = [
  { resource: 'assinatura', module: AssinaturaModule, controller: AssinaturaController, delegate: 'assinatura', ids: ['2'] },
  { resource: 'aula', module: AulaModule, controller: AulaController, delegate: 'aula', ids: ['2'] },
  { resource: 'avaliacao', module: AvaliacaoModule, controller: AvaliacaoController, delegate: 'avaliacao', ids: ['2'] },
  { resource: 'categoria', module: CategoriaModule, controller: CategoriaController, delegate: 'categoria', ids: ['2'] },
  { resource: 'certificado', module: CertificadoModule, controller: CertificadoController, delegate: 'certificado', ids: ['2'] },
  { resource: 'curso', module: CursoModule, controller: CursoController, delegate: 'curso', ids: ['2'] },
  { resource: 'matricula', module: MatriculaModule, controller: MatriculaController, delegate: 'matricula', ids: ['2'] },
  { resource: 'modulo', module: ModuloModule, controller: ModuloController, delegate: 'modulo', ids: ['2'] },
  { resource: 'pagamento', module: PagamentoModule, controller: PagamentoController, delegate: 'pagamento', ids: ['2'] },
  { resource: 'plano', module: PlanoModule, controller: PlanoController, delegate: 'plano', ids: ['2'] },
  { resource: 'progresso-aula', module: ProgressoAulaModule, controller: ProgressoAulaController, delegate: 'progressoAula', ids: ['2', '3'] },
  { resource: 'trilha', module: TrilhaModule, controller: TrilhaController, delegate: 'trilha', ids: ['2'] },
  { resource: 'trilha-curso', module: TrilhaCursoModule, controller: TrilhaCursoController, delegate: 'trilhaCurso', ids: ['2', '3'] },
  { resource: 'usuario', module: UsuarioModule, controller: UsuarioController, delegate: 'usuario', ids: ['2'] },
];

describe.each(cases)('Fluxo controller → service → Prisma: $resource', item => {
  const request: AuthenticatedRequest = { user: { userId: 1, name: 'Aluno', email: 'aluno@example.com', perfil: 'ALUNO' } };
  const delegate = { findMany: jest.fn(), findFirst: jest.fn() };
  let controller: {
    findAll(request: AuthenticatedRequest): Promise<unknown>;
    findOne(request: AuthenticatedRequest, ...ids: string[]): Promise<unknown>;
  };
  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({ imports: [item.module] })
      .overrideProvider(PrismaService).useValue({ [item.delegate]: delegate }).compile();
    controller = module.get<unknown>(item.controller) as typeof controller;
  });
  it('resolve as dependências e encaminha a listagem até o banco', async () => {
    delegate.findMany.mockResolvedValue([]);
    await expect(controller.findAll(request)).resolves.toEqual([]);
    expect(delegate.findMany).toHaveBeenCalledTimes(1);
    expect(delegate.findMany.mock.calls[0][0]).toHaveProperty('where');
  });
  it('propaga 403 quando a consulta com escopo não permite a leitura', async () => {
    delegate.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 2 });
    await expect(controller.findOne(request, ...item.ids)).rejects.toBeInstanceOf(ForbiddenException);
    expect(delegate.findFirst).toHaveBeenCalledTimes(2);
  });
});
