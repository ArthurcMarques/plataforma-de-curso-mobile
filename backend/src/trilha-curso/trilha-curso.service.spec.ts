import { Test, TestingModule } from '@nestjs/testing';
import { TrilhaCursoService } from './trilha-curso.service';

describe('TrilhaCursoService', () => {
  let service: TrilhaCursoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrilhaCursoService],
    }).compile();

    service = module.get<TrilhaCursoService>(TrilhaCursoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
