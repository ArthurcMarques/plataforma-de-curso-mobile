// Valida parâmetros e autoriza escritas; as leituras seguem pelo controller e service.
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { OPTIONAL_AUTH, PUBLIC_ROUTE } from './public.decorator';
import { AccessPolicyService } from './access-policy.service';

@Injectable()
export class AccessGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly policy: AccessPolicyService) {}
  async canActivate(context: ExecutionContext) {
    if (this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE, [context.getHandler(), context.getClass()])) return true;
    const resource = this.reflector.get<string>(PATH_METADATA, context.getClass());
    const request = context.switchToHttp().getRequest();
    const optional = this.reflector.getAllAndOverride<boolean>(OPTIONAL_AUTH, [context.getHandler(), context.getClass()]);
    if (optional) {
      if (!request.user) return true;
      if (request.user.perfil !== 'ADMINISTRADOR') {
        throw new ForbiddenException('Somente administradores autenticados podem cadastrar outros usuários.');
      }
    }
    if (resource === 'auth' && context.getHandler().name === 'me') return true;
    if (request.method === 'GET' || request.method === 'HEAD') {
      this.policy.validateParams(resource, request.params);
    } else {
      await this.policy.authorizeWrite(resource, request.method, request.params, request.body ?? {}, request.user, context.getHandler().name);
    }
    return true;
  }
}
