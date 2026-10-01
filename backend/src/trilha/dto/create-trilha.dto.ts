// Contrato de entrada para trilhas que organizam sequências de cursos. Os decoradores são executados pelo ValidationPipe antes de chamar o serviço.
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
