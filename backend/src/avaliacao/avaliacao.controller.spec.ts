// Testes de avaliações de cursos com nota de 1 a 5 e comentário. A criação do módulo de teste verifica a montagem das dependências; não substitui os testes de permissões da API.
import { Test, TestingModule } from '@nestjs/testing';
import { AvaliacaoController } from './avaliacao.controller';
import { AvaliacaoService } from './avaliacao.service';

describe('AvaliacaoController', () => {
  let controller: AvaliacaoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvaliacaoController],
      providers: [AvaliacaoService],
    }).useMocker(() => ({})).compile();

    controller = module.get<AvaliacaoController>(AvaliacaoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
