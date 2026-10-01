// Contrato de entrada para planos com preço e duração. Os decoradores são executados pelo ValidationPipe antes de chamar o serviço.
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
