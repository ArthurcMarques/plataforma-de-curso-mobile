// Testes de matrículas que vinculam usuários aos cursos. A criação do módulo de teste verifica a montagem das dependências; não substitui os testes de permissões da API.
import { Test, TestingModule } from '@nestjs/testing';
import { MatriculaController } from './matricula.controller';
import { MatriculaService } from './matricula.service';

describe('MatriculaController', () => {
  let controller: MatriculaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatriculaController],
      providers: [MatriculaService],
    }).useMocker(() => ({})).compile();

    controller = module.get<MatriculaController>(MatriculaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
