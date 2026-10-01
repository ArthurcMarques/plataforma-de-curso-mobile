import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { MetodoPagamento } from '../../generated/prisma/enums';

export class CreatePagamentoDto {
  @IsInt()
  idAssinatura!: number;

  @IsNumber()
  valorPago!: number;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-09-28T12:00:00.000Z',
  })
  @IsDateString()
  dataPagamento!: string;

  @ApiProperty({ enum: MetodoPagamento, example: 'PIX' })
  @IsEnum(MetodoPagamento)
  metodoPagamento!: MetodoPagamento;

  @IsString()
  @IsNotEmpty()
  idTransacaoGateway!: string;
}
