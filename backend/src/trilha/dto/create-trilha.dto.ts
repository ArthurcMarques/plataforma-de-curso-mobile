import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTrilhaDto {
  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsInt()
  idCategoria!: number;
}
