import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessGuard } from './access.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AccessPolicyService } from './access-policy.service';
import { OPTIONAL_AUTH } from './public.decorator';

describe('Cadastro com autenticação opcional', () => {
  const reflector = {
    getAllAndOverride: jest.fn((key: string) => key === OPTIONAL_AUTH),
    get: jest.fn(() => 'usuario'),
  } as unknown as Reflector;
  const policy = { authorizeWrite: jest.fn().mockResolvedValue(undefined) };
  function context(authorization?: string, perfil?: string) {
    return {
      getHandler: () => function create() {}, getClass: () => class Controller {},
      switchToHttp: () => ({ getRequest: () => ({
        headers: authorization === undefined ? {} : { authorization },
        user: perfil ? { userId: 1, perfil } : undefined,
        method: 'POST', params: {}, body: {},
      }) }),
    } as unknown as ExecutionContext;
  }
  afterEach(() => { jest.restoreAllMocks(); policy.authorizeWrite.mockClear(); });

  it('dispensa JWT apenas quando Authorization está ausente', () => {
    const authenticate = jest.spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate').mockReturnValue(true);
    expect(new JwtAuthGuard(reflector).canActivate(context())).toBe(true);
    expect(authenticate).not.toHaveBeenCalled();
  });
  it.each(['Bearer token', 'Bearer invalido', '', 'Basic abc'])('encaminha credencial %s ao Passport para validação', header => {
    const authenticate = jest.spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate').mockReturnValue(true);
    new JwtAuthGuard(reflector).canActivate(context(header));
    expect(authenticate).toHaveBeenCalledTimes(1);
  });
  it.each(['ALUNO', 'INSTRUTOR'])('nega cadastro autenticado como %s', async perfil => {
    const guard = new AccessGuard(reflector, policy as unknown as AccessPolicyService);
    await expect(guard.canActivate(context('Bearer token', perfil))).rejects.toBeInstanceOf(ForbiddenException);
    expect(policy.authorizeWrite).not.toHaveBeenCalled();
  });
  it('permite cadastro anônimo', async () => {
    const guard = new AccessGuard(reflector, policy as unknown as AccessPolicyService);
    await expect(guard.canActivate(context())).resolves.toBe(true);
  });
  it('autoriza administrador pela política de escrita', async () => {
    const guard = new AccessGuard(reflector, policy as unknown as AccessPolicyService);
    await expect(guard.canActivate(context('Bearer token', 'ADMINISTRADOR'))).resolves.toBe(true);
    expect(policy.authorizeWrite).toHaveBeenCalledTimes(1);
  });
});
