// Contrato de entrada para aulas vinculadas aos módulos do curso. Os decoradores são executados pelo ValidationPipe antes de chamar o serviço.
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TipoConteudo } from '../../generated/prisma/enums';

export class CreateAulaDto {
  @IsInt()
  idModulo!: number;

  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @ApiProperty({ enum: TipoConteudo, example: 'VIDEO' })
  @IsEnum(TipoConteudo)
  tipoConteudo!: TipoConteudo;

  @IsOptional()
  @IsString()
  urlConteudo?: string;

  @IsOptional()
  @IsInt()
  duracaoMinutos?: number;

  @IsInt()
  ordem!: number;
}
