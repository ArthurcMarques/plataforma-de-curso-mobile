// Testes de vínculos ordenados entre trilhas e cursos. A criação do módulo de teste verifica a montagem das dependências; não substitui os testes de permissões da API.
import { Test, TestingModule } from '@nestjs/testing';
import { TrilhaCursoController } from './trilha-curso.controller';
import { TrilhaCursoService } from './trilha-curso.service';

describe('TrilhaCursoController', () => {
  let controller: TrilhaCursoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrilhaCursoController],
      providers: [TrilhaCursoService],
    }).useMocker(() => ({})).compile();

    controller = module.get<TrilhaCursoController>(TrilhaCursoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
