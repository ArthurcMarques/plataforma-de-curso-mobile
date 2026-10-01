// Testes de assinaturas que vinculam usuários a planos e períodos de acesso. A criação do módulo de teste verifica a montagem das dependências; não substitui os testes de permissões da API.
import { Test, TestingModule } from '@nestjs/testing';
import { AssinaturaService } from './assinatura.service';

describe('AssinaturaService', () => {
  let service: AssinaturaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssinaturaService],
    }).compile();

    service = module.get<AssinaturaService>(AssinaturaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
