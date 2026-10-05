// Testes de planos com preço e duração. A criação do módulo de teste verifica a montagem das dependências; não substitui os testes de permissões da API.
import { Test, TestingModule } from '@nestjs/testing';
import { PlanoController } from './plano.controller';
import { PlanoService } from './plano.service';

describe('PlanoController', () => {
  let controller: PlanoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanoController],
      providers: [PlanoService],
    }).useMocker(() => ({})).compile();

    controller = module.get<PlanoController>(PlanoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
