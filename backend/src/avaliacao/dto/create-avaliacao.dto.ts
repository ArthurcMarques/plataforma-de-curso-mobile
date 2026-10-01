// Contrato de entrada para avaliações de cursos com nota de 1 a 5 e comentário. Os decoradores são executados pelo ValidationPipe antes de chamar o serviço.
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
