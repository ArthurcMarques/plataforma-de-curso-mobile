// Contrato de entrada para assinaturas que vinculam usuários a planos e períodos de acesso. Os decoradores são executados pelo ValidationPipe antes de chamar o serviço.
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt } from 'class-validator';

export class CreateAssinaturaDto {
  @IsInt()
  idUsuario!: number;

  @IsInt()
  idPlano!: number;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-09-28T12:00:00.000Z',
  })
  @IsDateString()
  dataInicio!: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-10-28T12:00:00.000Z',
  })
  @IsDateString()
  dataFim!: string;
}
