import { AccessPolicyModule } from '../auth/access-policy.module';
// Registra o controller e o serviço de matrículas que vinculam usuários aos cursos no contêiner de dependências do NestJS.
import { Module } from '@nestjs/common';
import { MatriculaService } from './matricula.service';
import { MatriculaController } from './matricula.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MessagingModule } from '../messaging/messaging.module';

@Module({
  imports: [PrismaModule, AccessPolicyModule, MessagingModule],
  controllers: [MatriculaController],
  providers: [MatriculaService],
})
export class MatriculaModule {}
