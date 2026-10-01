// Registra o controller e o serviço de certificados emitidos para usuários e cursos no contêiner de dependências do NestJS.
import { Module } from '@nestjs/common';
import { CertificadoService } from './certificado.service';
import { CertificadoController } from './certificado.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CertificadoController],
  providers: [CertificadoService],
})
export class CertificadoModule {}
