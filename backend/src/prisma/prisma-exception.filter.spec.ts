import type { ArgumentsHost } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaExceptionFilter } from './prisma-exception.filter';

describe('PrismaExceptionFilter', () => {
  it.each([
    ['P2002', 'POST', 409], ['P2003', 'DELETE', 409],
    ['P2003', 'POST', 400], ['P2025', 'PATCH', 404],
    ['P2020', 'POST', 400], ['P2024', 'GET', 503],
    ['P2034', 'PATCH', 409], ['P9999', 'GET', 500],
  ] as Array<[string, string, number]>)('%s em %s retorna %s sem expor a mensagem interna', (code, method, expected) => {
    const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const host = { switchToHttp: () => ({ getRequest: () => ({ method }), getResponse: () => response }) } as unknown as ArgumentsHost;
    const error = new Prisma.PrismaClientKnownRequestError('SQL e informações privadas', { code, clientVersion: '7' });
    new PrismaExceptionFilter().catch(error, host);
    expect(response.status).toHaveBeenCalledWith(expected);
    expect(response.json.mock.calls[0][0].statusCode).toBe(expected);
    expect(JSON.stringify(response.json.mock.calls)).not.toContain('SQL e informações privadas');
  });
});
