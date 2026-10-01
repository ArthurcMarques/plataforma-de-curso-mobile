// Testes de módulos que agrupam e ordenam as aulas. A criação do módulo de teste verifica a montagem das dependências; não substitui os testes de permissões da API.
import { Test, TestingModule } from '@nestjs/testing';
import { ModuloController } from './modulo.controller';
import { ModuloService } from './modulo.service';

describe('ModuloController', () => {
  let controller: ModuloController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModuloController],
      providers: [ModuloService],
    }).compile();

    controller = module.get<ModuloController>(ModuloController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
