// Testes de trilhas que organizam sequências de cursos. A criação do módulo de teste verifica a montagem das dependências; não substitui os testes de permissões da API.
import { Test, TestingModule } from '@nestjs/testing';
import { TrilhaController } from './trilha.controller';
import { TrilhaService } from './trilha.service';

describe('TrilhaController', () => {
  let controller: TrilhaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrilhaController],
      providers: [TrilhaService],
    }).compile();

    controller = module.get<TrilhaController>(TrilhaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
