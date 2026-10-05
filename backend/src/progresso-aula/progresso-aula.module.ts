import { AccessPolicyModule } from '../auth/access-policy.module';
// Registra o controller e o serviço de conclusões de aulas identificadas pelo par usuário/aula no contêiner de dependências do NestJS.
import { Module } from '@nestjs/common';
import { ProgressoAulaService } from './progresso-aula.service';
import { ProgressoAulaController } from './progresso-aula.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, AccessPolicyModule],
  controllers: [ProgressoAulaController],
  providers: [ProgressoAulaService],
})
export class ProgressoAulaModule {}
