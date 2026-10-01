import { IsInt } from 'class-validator';

export class CreateTrilhaCursoDto {
  @IsInt()
  idTrilha!: number;

  @IsInt()
  idCurso!: number;

  @IsInt()
  ordem!: number;
}
