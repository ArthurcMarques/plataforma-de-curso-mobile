// Teste de montagem e comportamento básico do componente; depende dos providers configurados no módulo de teste.
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  it('encerra a conexão ao destruir o módulo, sem exigir banco no teste', async () => {
    const disconnect = jest.fn().mockResolvedValue(undefined);
    await PrismaService.prototype.onModuleDestroy.call({ $disconnect: disconnect } as unknown as PrismaService);
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
