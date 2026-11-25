import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AccessPolicyService } from './access-policy.service';
import type { PrismaService } from '../prisma/prisma.service';
import type { SessionUser } from './session-user';

describe('AccessPolicyService: erros e escopo', () => {
  const student: SessionUser = { userId: 1, name: 'Aluno', email: 'aluno@example.com', perfil: 'ALUNO' };
  let delegate: { findFirst: jest.Mock; findMany: jest.Mock };
  let assinaturaDelegate: { findUnique: jest.Mock };
  let policy: AccessPolicyService;
  beforeEach(() => {
    delegate = { findFirst: jest.fn(), findMany: jest.fn() };
    assinaturaDelegate = { findUnique: jest.fn() };
    policy = new AccessPolicyService({ usuario: delegate, progressoAula: delegate, assinatura: assinaturaDelegate } as unknown as PrismaService);
  });
  it('retorna o registro permitido sem consulta extra', async () => {
    delegate.findFirst.mockResolvedValue({ ID_Usuario: 1 });
    await expect(policy.read('usuario', student, { id: '1' })).resolves.toEqual({ ID_Usuario: 1 });
    expect(delegate.findFirst).toHaveBeenCalledTimes(1);
    expect(delegate.findFirst.mock.calls[0][0].omit).toEqual({ SenhaHash: true });
  });
  it('retorna 403 quando a chave existe fora do escopo, consultando somente o ID', async () => {
    delegate.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({ ID_Usuario: 2 });
    await expect(policy.read('usuario', student, { id: '2' })).rejects.toBeInstanceOf(ForbiddenException);
    expect(delegate.findFirst.mock.calls[1][0]).toEqual({ where: { ID_Usuario: 2 }, select: { ID_Usuario: true } });
  });
  it('retorna 404 quando o registro não existe', async () => {
    delegate.findFirst.mockResolvedValue(null);
    await expect(policy.read('usuario', student, { id: '2' })).rejects.toBeInstanceOf(NotFoundException);
  });
  it('mantém listagens vazias como sucesso e aplica o escopo', async () => {
    delegate.findMany.mockResolvedValue([]);
    await expect(policy.read('usuario', student, {})).resolves.toEqual([]);
    expect(delegate.findMany).toHaveBeenCalledWith({ where: { ID_Usuario: 1 }, omit: { SenhaHash: true } });
  });
  it.each(['abc', '0', '-1', '1.5', '1e2', '2147483648'])('retorna 400 para ID %s', async id => {
    await expect(policy.read('usuario', student, { id })).rejects.toBeInstanceOf(BadRequestException);
    expect(delegate.findFirst).not.toHaveBeenCalled();
  });
  it('distingue acesso proibido também em chaves compostas', async () => {
    delegate.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({ ID_Usuario: 2, ID_Aula: 3 });
    await expect(policy.read('progresso-aula', student, { idUsuario: '2', idAula: '3' })).rejects.toBeInstanceOf(ForbiddenException);
  });
  it('valida parâmetros antes da escrita administrativa', async () => {
    await expect(policy.authorizeWrite('usuario', 'PATCH', { id: 'abc' }, {}, { ...student, perfil: 'ADMINISTRADOR' }, 'update')).rejects.toBeInstanceOf(BadRequestException);
  });
  it('aluno cria assinatura em seu próprio nome', async () => {
    await expect(policy.authorizeWrite('assinatura', 'POST', {}, { idUsuario: 1, idPlano: 2, dataInicio: '2026-01-01T00:00:00.000Z', dataFim: '2026-02-01T00:00:00.000Z' }, student, 'create')).resolves.toBeUndefined();
  });
  it('aluno não pode criar assinatura em nome de outro usuário', async () => {
    await expect(policy.authorizeWrite('assinatura', 'POST', {}, { idUsuario: 2, idPlano: 2, dataInicio: '2026-01-01T00:00:00.000Z', dataFim: '2026-02-01T00:00:00.000Z' }, student, 'create')).rejects.toBeInstanceOf(ForbiddenException);
  });
  it('aluno cria pagamento referenciando a própria assinatura', async () => {
    assinaturaDelegate.findUnique.mockResolvedValue({ ID_Usuario: 1 });
    await expect(policy.authorizeWrite('pagamento', 'POST', {}, { idAssinatura: 5, valorPago: 10, dataPagamento: '2026-01-01T00:00:00.000Z', metodoPagamento: 'PIX', idTransacaoGateway: 'abc' }, student, 'create')).resolves.toBeUndefined();
  });
  it('aluno não pode criar pagamento referenciando assinatura de outro usuário', async () => {
    assinaturaDelegate.findUnique.mockResolvedValue({ ID_Usuario: 2 });
    await expect(policy.authorizeWrite('pagamento', 'POST', {}, { idAssinatura: 5, valorPago: 10, dataPagamento: '2026-01-01T00:00:00.000Z', metodoPagamento: 'PIX', idTransacaoGateway: 'abc' }, student, 'create')).rejects.toBeInstanceOf(ForbiddenException);
  });
  it('aluno não pode criar pagamento referenciando assinatura inexistente', async () => {
    assinaturaDelegate.findUnique.mockResolvedValue(null);
    await expect(policy.authorizeWrite('pagamento', 'POST', {}, { idAssinatura: 5, valorPago: 10, dataPagamento: '2026-01-01T00:00:00.000Z', metodoPagamento: 'PIX', idTransacaoGateway: 'abc' }, student, 'create')).rejects.toBeInstanceOf(BadRequestException);
  });
});
