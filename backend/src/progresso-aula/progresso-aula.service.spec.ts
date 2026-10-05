// Testes de conclusões de aulas identificadas pelo par usuário/aula. A criação do módulo de teste verifica a montagem das dependências; não substitui os testes de permissões da API.
import { Test, TestingModule } from '@nestjs/testing';
import { ProgressoAulaService } from './progresso-aula.service';

describe('ProgressoAulaService', () => {
  let service: ProgressoAulaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProgressoAulaService],
    }).useMocker(() => ({})).compile();

    service = module.get<ProgressoAulaService>(ProgressoAulaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
