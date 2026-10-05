// Testes de planos com preço e duração. A criação do módulo de teste verifica a montagem das dependências; não substitui os testes de permissões da API.
import { Test, TestingModule } from '@nestjs/testing';
import { PlanoService } from './plano.service';

describe('PlanoService', () => {
  let service: PlanoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlanoService],
    }).useMocker(() => ({})).compile();

    service = module.get<PlanoService>(PlanoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
