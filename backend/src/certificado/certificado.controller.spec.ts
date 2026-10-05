// Testes de certificados emitidos para usuários e cursos. A criação do módulo de teste verifica a montagem das dependências; não substitui os testes de permissões da API.
import { Test, TestingModule } from '@nestjs/testing';
import { CertificadoController } from './certificado.controller';
import { CertificadoService } from './certificado.service';

describe('CertificadoController', () => {
  let controller: CertificadoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CertificadoController],
      providers: [CertificadoService],
    }).useMocker(() => ({})).compile();

    controller = module.get<CertificadoController>(CertificadoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
