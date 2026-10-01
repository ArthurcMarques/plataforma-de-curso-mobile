// Registra o controller e o serviço de aulas vinculadas aos módulos do curso no contêiner de dependências do NestJS.
import { Module } from '@nestjs/common';
import { AulaService } from './aula.service';
import { AulaController } from './aula.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AulaController],
  providers: [AulaService],
})
export class AulaModule {}
