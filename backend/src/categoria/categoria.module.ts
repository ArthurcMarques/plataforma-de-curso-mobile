// Registra o controller e o serviço de categorias que organizam cursos e trilhas no contêiner de dependências do NestJS.
import { Module } from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { CategoriaController } from './categoria.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CategoriaController],
  providers: [CategoriaService],
})
export class CategoriaModule {}
