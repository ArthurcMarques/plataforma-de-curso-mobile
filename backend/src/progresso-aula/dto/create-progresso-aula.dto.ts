// Contrato de entrada para conclusões de aulas identificadas pelo par usuário/aula. Os decoradores são executados pelo ValidationPipe antes de chamar o serviço.
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional } from 'class-validator';
import { StatusProgresso } from '../../generated/prisma/enums';

export class CreateProgressoAulaDto {
  @IsInt()
  idUsuario!: number;

  @IsInt()
  idAula!: number;

  @ApiProperty({ enum: StatusProgresso, example: 'CONCLUIDO' })
  @IsEnum(StatusProgresso)
  status!: StatusProgresso;

  @ApiProperty({
    type: String,
    format: 'date-time',
    required: false,
    example: '2026-09-28T23:30:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  dataConclusao?: string;
}
