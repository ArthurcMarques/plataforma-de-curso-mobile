import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePlanoDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsNumber()
  preco!: number;

  @IsInt()
  duracaoMeses!: number;
}
