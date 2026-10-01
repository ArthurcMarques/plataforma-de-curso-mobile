import { Test, TestingModule } from '@nestjs/testing';
import { TrilhaCursoController } from './trilha-curso.controller';
import { TrilhaCursoService } from './trilha-curso.service';

describe('TrilhaCursoController', () => {
  let controller: TrilhaCursoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrilhaCursoController],
      providers: [TrilhaCursoService],
    }).compile();

    controller = module.get<TrilhaCursoController>(TrilhaCursoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
