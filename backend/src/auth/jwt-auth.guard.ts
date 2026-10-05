// Exige JWT nas rotas protegidas e respeita os metadados de rotas públicas.
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { OPTIONAL_AUTH, PUBLIC_ROUTE } from './public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) { super(); }
  canActivate(context: ExecutionContext) {
    if (this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE, [context.getHandler(), context.getClass()])) return true;
    const optional = this.reflector.getAllAndOverride<boolean>(OPTIONAL_AUTH, [context.getHandler(), context.getClass()]);
    const request = context.switchToHttp().getRequest();
    if (optional && request.headers.authorization === undefined) return true;
    return super.canActivate(context);
  }
}
