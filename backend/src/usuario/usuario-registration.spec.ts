import { validate } from 'class-validator';
import { Test } from '@nestjs/testing';
import { UsuarioService } from './usuario.service';
import { PrismaService } from '../prisma/prisma.service';
import { AccessPolicyService } from '../auth/access-policy.service';
import { KafkaProducerService } from '../messaging/kafka-producer.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UsuarioController } from './usuario.controller';
import { PUBLIC_ROUTE } from '../auth/public.decorator';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AccessGuard } from '../auth/access.guard';
import type { ExecutionContext } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

describe('Cadastro com perfil', () => {
  let service: UsuarioService;
  const body = { name: 'Ana Silva', email: 'ana@example.com', password: '123456' };
  const create = jest.fn().mockResolvedValue({ ID_Usuario: 1, NomeCompleto: body.name, Email: body.email, DataCadastro: new Date('2026-01-01T00:00:00.000Z') });

  it('rota de cadastro dispensa autenticacao e autorizacao', async () => {
    const handler = UsuarioController.prototype.create;
    expect(Reflect.getMetadata(PUBLIC_ROUTE, handler)).toBe(true);
    const context = {
      getHandler: () => handler,
      getClass: () => UsuarioController,
    } as unknown as ExecutionContext;
    const reflector = new Reflector();
    expect(new JwtAuthGuard(reflector).canActivate(context)).toBe(true);
    const policy = { authorizeWrite: jest.fn() };
    await expect(new AccessGuard(reflector, policy as unknown as AccessPolicyService).canActivate(context)).resolves.toBe(true);
    expect(policy.authorizeWrite).not.toHaveBeenCalled();
  });

  beforeEach(async () => {
    create.mockClear();
    const module = await Test.createTestingModule({ providers: [
      UsuarioService,
      { provide: PrismaService, useValue: { usuario: { create } } },
      { provide: AccessPolicyService, useValue: {} },
      { provide: KafkaProducerService, useValue: { publishUsuarioCriado: jest.fn() } },
    ] }).compile();
    service = module.get(UsuarioService);
  });

  it.each(['ALUNO', 'INSTRUTOR', 'ADMINISTRADOR'] as const)('cadastro publico cria %s', async perfil => {
    await service.create({ ...body, perfil });
    expect(create).toHaveBeenCalledWith({
      data: { NomeCompleto: body.name, Email: body.email, SenhaHash: 'hashed-password', Perfil: perfil },
      omit: { SenhaHash: true },
    });
  });

  it('cadastro publico assume ALUNO quando omitido', async () => {
    await service.create(body);
    for (const [options] of create.mock.calls) expect(options.data.Perfil).toBe('ALUNO');
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('cadastro publico aceita ALUNO explicito', async () => {
    await service.create({ ...body, perfil: 'ALUNO' });
    expect(create).toHaveBeenCalledTimes(1);
  });

  it.each([null, 'INVALIDO'])('DTO rejeita perfil %s', async perfil => {
    const errors = await validate(Object.assign(new CreateUsuarioDto(), body, { perfil }));
    expect(errors.some(error => error.property === 'perfil')).toBe(true);
  });
});
