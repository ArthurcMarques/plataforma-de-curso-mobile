import { AccessPolicyModule } from '../auth/access-policy.module';
// Registra o controller e o serviço de módulos que agrupam e ordenam as aulas no contêiner de dependências do NestJS.
import { Module } from '@nestjs/common';
import { ModuloService } from './modulo.service';
import { ModuloController } from './modulo.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, AccessPolicyModule],
  controllers: [ModuloController],
  providers: [ModuloService],
})
export class ModuloModule {}
