import { AccessPolicyModule } from '../auth/access-policy.module';
// Registra o controller e o serviço de cursos associados a categoria e instrutor no contêiner de dependências do NestJS.
import { Module } from '@nestjs/common';
import { CursoService } from './curso.service';
import { CursoController } from './curso.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, AccessPolicyModule],
  controllers: [CursoController],
  providers: [CursoService],
})
export class CursoModule {}
