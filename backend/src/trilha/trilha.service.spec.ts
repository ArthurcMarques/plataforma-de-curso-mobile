// Testes de trilhas que organizam sequências de cursos. A criação do módulo de teste verifica a montagem das dependências; não substitui os testes de permissões da API.
import { Test, TestingModule } from '@nestjs/testing';
import { TrilhaService } from './trilha.service';

describe('TrilhaService', () => {
  let service: TrilhaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrilhaService],
    }).compile();

    service = module.get<TrilhaService>(TrilhaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
