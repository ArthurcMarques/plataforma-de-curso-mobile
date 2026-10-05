// Testes de conclusões de aulas identificadas pelo par usuário/aula. A criação do módulo de teste verifica a montagem das dependências; não substitui os testes de permissões da API.
import { Test, TestingModule } from '@nestjs/testing';
import { ProgressoAulaController } from './progresso-aula.controller';
import { ProgressoAulaService } from './progresso-aula.service';

describe('ProgressoAulaController', () => {
  let controller: ProgressoAulaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgressoAulaController],
      providers: [ProgressoAulaService],
    }).useMocker(() => ({})).compile();

    controller = module.get<ProgressoAulaController>(ProgressoAulaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
