import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional } from 'class-validator';

export class CreateMatriculaDto {
  @IsInt()
  idUsuario!: number;

  @IsInt()
  idCurso!: number;

  @ApiProperty({
    type: String,
    format: 'date-time',
    required: false,
    example: '2026-09-28T12:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  dataConclusao?: string;
}
