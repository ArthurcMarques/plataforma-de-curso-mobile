// Testes de matrículas que vinculam usuários aos cursos. A criação do módulo de teste verifica a montagem das dependências; não substitui os testes de permissões da API.
import { Test, TestingModule } from '@nestjs/testing';
import { MatriculaService } from './matricula.service';

describe('MatriculaService', () => {
  let service: MatriculaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatriculaService],
    }).compile();

    service = module.get<MatriculaService>(MatriculaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
