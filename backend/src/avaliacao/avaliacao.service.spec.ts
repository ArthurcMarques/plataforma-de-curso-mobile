// Testes de avaliações de cursos com nota de 1 a 5 e comentário. A criação do módulo de teste verifica a montagem das dependências; não substitui os testes de permissões da API.
import { Test, TestingModule } from '@nestjs/testing';
import { AvaliacaoService } from './avaliacao.service';

describe('AvaliacaoService', () => {
  let service: AvaliacaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AvaliacaoService],
    }).compile();

    service = module.get<AvaliacaoService>(AvaliacaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
