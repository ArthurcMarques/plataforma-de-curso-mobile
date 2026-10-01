// Contrato de entrada para vínculos ordenados entre trilhas e cursos. Os decoradores são executados pelo ValidationPipe antes de chamar o serviço.
import { IsInt } from 'class-validator';

export class CreateTrilhaCursoDto {
  @IsInt()
  idTrilha!: number;

  @IsInt()
  idCurso!: number;

  @IsInt()
  ordem!: number;
}
