import { IsDateString, IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateAvaliacaoDto {
  @IsInt()
  idUsuario!: number;

  @IsInt()
  idCurso!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  nota!: number;

  @IsOptional()
  @IsString()
  comentario?: string;

  @IsOptional()
  @IsDateString({ strict: true })
  dataAvaliacao?: string;
}
