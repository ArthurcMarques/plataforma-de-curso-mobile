import { AccessPolicyModule } from '../auth/access-policy.module';
// Registra o controller e o serviço de assinaturas que vinculam usuários a planos e períodos de acesso no contêiner de dependências do NestJS.
import { Module } from '@nestjs/common';
import { AssinaturaService } from './assinatura.service';
import { AssinaturaController } from './assinatura.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, AccessPolicyModule],
  controllers: [AssinaturaController],
  providers: [AssinaturaService],
})
export class AssinaturaModule {}
