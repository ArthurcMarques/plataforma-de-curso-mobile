import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateAvaliacaoDto {
  @IsInt()
  idUsuario!: number;

  @IsInt()
  idCurso!: number;

  @IsInt()
  nota!: number;

  @IsOptional()
  @IsString()
  comentario?: string;
}
