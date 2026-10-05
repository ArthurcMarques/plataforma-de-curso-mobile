// Testes de aulas vinculadas aos módulos do curso. A criação do módulo de teste verifica a montagem das dependências; não substitui os testes de permissões da API.
import { Test, TestingModule } from '@nestjs/testing';
import { AulaService } from './aula.service';

describe('AulaService', () => {
  let service: AulaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AulaService],
    }).useMocker(() => ({})).compile();

    service = module.get<AulaService>(AulaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
