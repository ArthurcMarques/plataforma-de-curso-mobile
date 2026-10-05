// Testes de assinaturas que vinculam usuários a planos e períodos de acesso. A criação do módulo de teste verifica a montagem das dependências; não substitui os testes de permissões da API.
import { Test, TestingModule } from '@nestjs/testing';
import { AssinaturaController } from './assinatura.controller';
import { AssinaturaService } from './assinatura.service';

describe('AssinaturaController', () => {
  let controller: AssinaturaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssinaturaController],
      providers: [AssinaturaService],
    }).useMocker(() => ({})).compile();

    controller = module.get<AssinaturaController>(AssinaturaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
