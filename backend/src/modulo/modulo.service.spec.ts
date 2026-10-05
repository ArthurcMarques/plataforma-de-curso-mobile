// Testes de módulos que agrupam e ordenam as aulas. A criação do módulo de teste verifica a montagem das dependências; não substitui os testes de permissões da API.
import { Test, TestingModule } from '@nestjs/testing';
import { ModuloService } from './modulo.service';

describe('ModuloService', () => {
  let service: ModuloService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModuloService],
    }).useMocker(() => ({})).compile();

    service = module.get<ModuloService>(ModuloService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
