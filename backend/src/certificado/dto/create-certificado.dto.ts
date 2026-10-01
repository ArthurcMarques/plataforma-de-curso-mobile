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
