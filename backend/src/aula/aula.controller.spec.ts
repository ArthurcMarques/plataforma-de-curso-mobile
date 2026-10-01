// Testes de aulas vinculadas aos módulos do curso. A criação do módulo de teste verifica a montagem das dependências; não substitui os testes de permissões da API.
import { Test, TestingModule } from '@nestjs/testing';
import { AulaController } from './aula.controller';
import { AulaService } from './aula.service';

describe('AulaController', () => {
  let controller: AulaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AulaController],
      providers: [AulaService],
    }).compile();

    controller = module.get<AulaController>(AulaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
