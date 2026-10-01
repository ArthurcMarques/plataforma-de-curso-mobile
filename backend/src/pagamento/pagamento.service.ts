import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePagamentoDto } from './dto/create-pagamento.dto';
import { UpdatePagamentoDto } from './dto/update-pagamento.dto';

@Injectable()
export class PagamentoService {
  constructor(private readonly prisma: PrismaService) {}

  create(createPagamentoDto: CreatePagamentoDto) {
    return this.prisma.pagamento.create({
      data: {
        ID_Assinatura: createPagamentoDto.idAssinatura,
        ValorPago: createPagamentoDto.valorPago,
        DataPagamento: new Date(createPagamentoDto.dataPagamento),
        MetodoPagamento: createPagamentoDto.metodoPagamento,
        Id_Transacao_Gateway: createPagamentoDto.idTransacaoGateway,
      },
    });
  }

  findAll() {
    return this.prisma.pagamento.findMany();
  }

  findOne(id: number) {
    return this.prisma.pagamento.findUnique({ where: { ID_Pagamento: id } });
  }

  update(id: number, updatePagamentoDto: UpdatePagamentoDto) {
    return this.prisma.pagamento.update({
      where: { ID_Pagamento: id },
      data: {
        ID_Assinatura: updatePagamentoDto.idAssinatura,
        ValorPago: updatePagamentoDto.valorPago,
        DataPagamento:
          updatePagamentoDto.dataPagamento === undefined
            ? undefined
            : new Date(updatePagamentoDto.dataPagamento),
        MetodoPagamento: updatePagamentoDto.metodoPagamento,
        Id_Transacao_Gateway: updatePagamentoDto.idTransacaoGateway,
      },
    });
  }

  remove(id: number) {
    return this.prisma.pagamento.delete({ where: { ID_Pagamento: id } });
  }
}
