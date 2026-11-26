// Persistência de pagamentos associados às assinaturas. Converte os DTOs da API para os campos do Prisma; a autorização HTTP fica em AccessPolicyService.
import { AccessPolicyService } from '../auth/access-policy.service';
import type { SessionUser } from '../auth/session-user';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePagamentoDto } from './dto/create-pagamento.dto';
import { UpdatePagamentoDto } from './dto/update-pagamento.dto';
import { KafkaProducerService } from '../messaging/kafka-producer.service';

@Injectable()
export class PagamentoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AccessPolicyService,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async create(createPagamentoDto: CreatePagamentoDto) {
    const pagamento = await this.prisma.pagamento.create({
      data: {
        ID_Assinatura: createPagamentoDto.idAssinatura,
        ValorPago: createPagamentoDto.valorPago,
        DataPagamento: new Date(createPagamentoDto.dataPagamento),
        MetodoPagamento: createPagamentoDto.metodoPagamento,
        Id_Transacao_Gateway: createPagamentoDto.idTransacaoGateway,
      },
    });

    // Pagamento não tem idUsuario direto; o vínculo é pela assinatura.
    const assinatura = await this.prisma.assinatura.findUnique({
      where: { ID_Assinatura: pagamento.ID_Assinatura }, select: { ID_Usuario: true },
    });
    if (assinatura) {
      void this.kafkaProducer.publishPagamentoConfirmado({ idUsuario: assinatura.ID_Usuario, valorPago: Number(pagamento.ValorPago) });
    }

    return pagamento;
  }

  // O controller encaminha a sessão; a política aplica o escopo antes de consultar o Prisma.
  findAll(user: SessionUser) {
    return this.access.read('pagamento', user, {});
  }

  findOne(id: number, user: SessionUser) {
    return this.access.read('pagamento', user, { id: String(id) });
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
