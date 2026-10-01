// Testes de pagamentos associados às assinaturas. A criação do módulo de teste verifica a montagem das dependências; não substitui os testes de permissões da API.
import { Test, TestingModule } from '@nestjs/testing';
import { PagamentoService } from './pagamento.service';

describe('PagamentoService', () => {
  let service: PagamentoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PagamentoService],
    }).compile();

    service = module.get<PagamentoService>(PagamentoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
