// Contrato de entrada para módulos que agrupam e ordenam as aulas. Os decoradores são executados pelo ValidationPipe antes de chamar o serviço.
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateModuloDto {
  @IsInt()
  idCurso!: number;

  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @IsInt()
  ordem!: number;
}
