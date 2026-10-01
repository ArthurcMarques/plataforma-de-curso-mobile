// Testes de pagamentos associados às assinaturas. A criação do módulo de teste verifica a montagem das dependências; não substitui os testes de permissões da API.
import { Test, TestingModule } from '@nestjs/testing';
import { PagamentoController } from './pagamento.controller';
import { PagamentoService } from './pagamento.service';

describe('PagamentoController', () => {
  let controller: PagamentoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PagamentoController],
      providers: [PagamentoService],
    }).compile();

    controller = module.get<PagamentoController>(PagamentoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
