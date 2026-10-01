// Registra o controller e o serviço de matrículas que vinculam usuários aos cursos no contêiner de dependências do NestJS.
import { Module } from '@nestjs/common';
import { MatriculaService } from './matricula.service';
import { MatriculaController } from './matricula.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MatriculaController],
  providers: [MatriculaService],
})
export class MatriculaModule {}
