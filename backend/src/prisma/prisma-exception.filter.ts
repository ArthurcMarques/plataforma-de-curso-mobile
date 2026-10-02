import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Prisma } from '../generated/prisma/client';

// Traduz falhas conhecidas do banco sem expor SQL, credenciais ou detalhes internos.
@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError, Prisma.PrismaClientInitializationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const method = http.getRequest<Request>().method;
    let status = 500;
    let error = 'Internal Server Error';
    let message = 'Não foi possível concluir a operação.';

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          status = 409; error = 'Conflict'; message = 'Já existe um registro com os dados únicos informados.'; break;
        case 'P2003': case 'P2014':
          status = method === 'DELETE' ? 409 : 400;
          error = status === 409 ? 'Conflict' : 'Bad Request';
          message = status === 409 ? 'O registro possui vínculos que impedem a exclusão.' : 'Um dos vínculos informados não existe ou é inválido.';
          break;
        case 'P2025':
          status = 404; error = 'Not Found'; message = 'Registro não encontrado.'; break;
        case 'P2000': case 'P2006': case 'P2007': case 'P2011': case 'P2012': case 'P2013': case 'P2020':
          status = 400; error = 'Bad Request'; message = 'Dados inválidos ou fora dos limites permitidos.'; break;
        case 'P2034':
          status = 409; error = 'Conflict'; message = 'Conflito com outra operação. Tente novamente.'; break;
        case 'P1001': case 'P1002': case 'P1008': case 'P1017': case 'P2024': case 'P2037':
          status = 503; error = 'Service Unavailable'; message = 'Banco de dados temporariamente indisponível.'; break;
      }
    } else if (exception instanceof Prisma.PrismaClientInitializationError) {
      status = 503; error = 'Service Unavailable'; message = 'Banco de dados indisponível.';
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      // DTOs são a primeira validação; isto cobre valores incompatíveis que chegam ao Prisma.
      status = 400; error = 'Bad Request'; message = 'Dados incompatíveis com a operação solicitada.';
    }
    if (status >= 500) this.logger.error(`Falha de persistência: ${exception.name}`);
    http.getResponse<Response>().status(status).json({ statusCode: status, error, message });
  }
}
