import { AccessPolicyModule } from '../auth/access-policy.module';
// Registra o controller e o serviço de notificações do usuário no contêiner de dependências do NestJS.
import { Module } from '@nestjs/common';
import { NotificacaoService } from './notificacao.service';
import { NotificacaoController } from './notificacao.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, AccessPolicyModule],
  controllers: [NotificacaoController],
  providers: [NotificacaoService],
})
export class NotificacaoModule {}
