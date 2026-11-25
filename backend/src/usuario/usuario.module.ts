import { AccessPolicyModule } from '../auth/access-policy.module';
// Registra o controller e o serviço de contas de usuários e seus perfis de acesso no contêiner de dependências do NestJS.
import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MessagingModule } from '../messaging/messaging.module';

@Module({
  imports: [PrismaModule, AccessPolicyModule, MessagingModule],
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports: [UsuarioService],
})
export class UsuarioModule {}
