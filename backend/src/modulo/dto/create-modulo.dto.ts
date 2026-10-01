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
