// Testes de certificados emitidos para usuários e cursos. A criação do módulo de teste verifica a montagem das dependências; não substitui os testes de permissões da API.
import { Test, TestingModule } from '@nestjs/testing';
import { CertificadoService } from './certificado.service';

describe('CertificadoService', () => {
  let service: CertificadoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CertificadoService],
    }).useMocker(() => ({})).compile();

    service = module.get<CertificadoService>(CertificadoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
