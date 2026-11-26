import { AccessPolicyModule } from '../auth/access-policy.module';
// Registra o controller e o serviço de pagamentos associados às assinaturas no contêiner de dependências do NestJS.
import { Module } from '@nestjs/common';
import { PagamentoService } from './pagamento.service';
import { PagamentoController } from './pagamento.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MessagingModule } from '../messaging/messaging.module';

@Module({
  imports: [PrismaModule, AccessPolicyModule, MessagingModule],
  controllers: [PagamentoController],
  providers: [PagamentoService],
})
export class PagamentoModule {}
