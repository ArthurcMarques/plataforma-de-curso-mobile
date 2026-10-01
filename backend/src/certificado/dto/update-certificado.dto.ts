// Contrato de alteração de certificados emitidos para usuários e cursos. PartialType torna opcionais os campos do cadastro e reaproveita seus validadores.
import { PartialType } from '@nestjs/swagger';
import { CreateCertificadoDto } from './create-certificado.dto';

export class UpdateCertificadoDto extends PartialType(CreateCertificadoDto) {}
