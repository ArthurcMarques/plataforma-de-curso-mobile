import { ForbiddenException } from '@nestjs/common';
import { validate } from 'class-validator';
import { Test } from '@nestjs/testing';
import { UsuarioService } from './usuario.service';
import { PrismaService } from '../prisma/prisma.service';
import { AccessPolicyService } from '../auth/access-policy.service';
import type { SessionUser } from '../auth/session-user';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

describe('Cadastro com perfil', () => {
  let service: UsuarioService;
  const create = jest.fn().mockResolvedValue({ ID_Usuario: 1 });
  const body = { name: 'Ana Silva', email: 'ana@example.com', password: '123456' };
  const actor = (perfil: SessionUser['perfil']): SessionUser => ({
    userId: 10, name: 'Administrador', email: 'admin@example.com', perfil,
  });

  beforeEach(async () => {
    create.mockClear();
    const module = await Test.createTestingModule({ providers: [
      UsuarioService,
      { provide: PrismaService, useValue: { usuario: { create } } },
      { provide: AccessPolicyService, useValue: {} },
    ] }).compile();
    service = module.get(UsuarioService);
  });

  it.each(['ALUNO', 'INSTRUTOR', 'ADMINISTRADOR'] as const)('administrador cria %s', async perfil => {
    await service.create({ ...body, perfil }, actor('ADMINISTRADOR'));
    expect(create).toHaveBeenCalledWith({
      data: { NomeCompleto: body.name, Email: body.email, SenhaHash: 'hashed-password', Perfil: perfil },
      omit: { SenhaHash: true },
    });
  });

  it('cadastro publico e administrador assumem ALUNO quando omitido', async () => {
    await service.create(body);
    await service.create(body, actor('ADMINISTRADOR'));
    for (const [options] of create.mock.calls) expect(options.data.Perfil).toBe('ALUNO');
    expect(create).toHaveBeenCalledTimes(2);
  });

  it('cadastro publico aceita ALUNO explicito', async () => {
    await service.create({ ...body, perfil: 'ALUNO' });
    expect(create).toHaveBeenCalledTimes(1);
  });

  it.each(['INSTRUTOR', 'ADMINISTRADOR'] as const)('cadastro publico rejeita %s sem inserir', async perfil => {
    await expect(service.create({ ...body, perfil })).rejects.toBeInstanceOf(ForbiddenException);
    expect(create).not.toHaveBeenCalled();
  });

  it.each(['ALUNO', 'INSTRUTOR'] as const)('token de %s nao pode cadastrar', async perfil => {
    await expect(service.create(body, actor(perfil))).rejects.toBeInstanceOf(ForbiddenException);
    expect(create).not.toHaveBeenCalled();
  });

  it.each([null, 'INVALIDO'])('DTO rejeita perfil %s', async perfil => {
    const errors = await validate(Object.assign(new CreateUsuarioDto(), body, { perfil }));
    expect(errors.some(error => error.property === 'perfil')).toBe(true);
  });
});
