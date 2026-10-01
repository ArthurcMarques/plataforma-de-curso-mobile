// Contrato de entrada para certificados emitidos para usuários e cursos. Os decoradores são executados pelo ValidationPipe antes de chamar o serviço.
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCertificadoDto {
  @IsInt()
  idUsuario!: number;

  @IsInt()
  idCurso!: number;

  @IsOptional()
  @IsInt()
  idTrilha?: number;

  @IsString()
  @IsNotEmpty()
  codigoVerificacao!: string;
}
