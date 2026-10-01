import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { NivelCurso } from '../../generated/prisma/enums';

export class CreateCursoDto {
  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsInt()
  idInstrutor!: number;

  @IsInt()
  idCategoria!: number;

  @ApiProperty({ enum: NivelCurso, example: 'INICIANTE' })
  @IsEnum(NivelCurso)
  nivel!: NivelCurso;

  @ApiProperty({
    type: String,
    format: 'date-time',
    required: false,
    example: '2026-09-23T12:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  dataPublicacao?: string;

  @IsInt()
  totalAulas!: number;

  @IsNumber()
  totalHoras!: number;
}
