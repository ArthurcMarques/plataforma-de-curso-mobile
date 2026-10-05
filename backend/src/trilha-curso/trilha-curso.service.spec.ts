// Testes de vínculos ordenados entre trilhas e cursos. A criação do módulo de teste verifica a montagem das dependências; não substitui os testes de permissões da API.
import { Test, TestingModule } from '@nestjs/testing';
import { TrilhaCursoService } from './trilha-curso.service';

describe('TrilhaCursoService', () => {
  let service: TrilhaCursoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrilhaCursoService],
    }).useMocker(() => ({})).compile();

    service = module.get<TrilhaCursoService>(TrilhaCursoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
