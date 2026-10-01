// Devolve a consulta preparada pelo guard, evitando executar a leitura genérica do controller.
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { of } from 'rxjs';

@Injectable()
export class ScopedReadInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    // A consulta ja foi limitada no banco, sem carregar dados de outros usuarios.
    return request.hasScopedResult ? of(request.scopedResult) : next.handle();
  }
}
