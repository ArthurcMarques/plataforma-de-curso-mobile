import { Test, TestingModule } from '@nestjs/testing';
import { ProgressoAulaController } from './progresso-aula.controller';
import { ProgressoAulaService } from './progresso-aula.service';

describe('ProgressoAulaController', () => {
  let controller: ProgressoAulaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgressoAulaController],
      providers: [ProgressoAulaService],
    }).compile();

    controller = module.get<ProgressoAulaController>(ProgressoAulaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
