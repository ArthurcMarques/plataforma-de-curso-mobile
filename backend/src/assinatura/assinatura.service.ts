// Persistência de assinaturas que vinculam usuários a planos e períodos de acesso. Converte os DTOs da API para os campos do Prisma; a autorização HTTP fica em AccessPolicyService.
import { AccessPolicyService } from '../auth/access-policy.service';
import type { SessionUser } from '../auth/session-user';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssinaturaDto } from './dto/create-assinatura.dto';
import { UpdateAssinaturaDto } from './dto/update-assinatura.dto';

@Injectable()
export class AssinaturaService {
  constructor(private readonly prisma: PrismaService, private readonly access: AccessPolicyService) {}

  create(createAssinaturaDto: CreateAssinaturaDto) {
    return this.prisma.assinatura.create({
      data: {
        ID_Usuario: createAssinaturaDto.idUsuario,
        ID_Plano: createAssinaturaDto.idPlano,
        DataInicio: new Date(createAssinaturaDto.dataInicio),
        DataFim: new Date(createAssinaturaDto.dataFim),
      },
    });
  }

  // O controller encaminha a sessão; a política aplica o escopo antes de consultar o Prisma.
  findAll(user: SessionUser) {
    return this.access.read('assinatura', user, {});
  }

  findOne(id: number, user: SessionUser) {
    return this.access.read('assinatura', user, { id: String(id) });
  }

  update(id: number, updateAssinaturaDto: UpdateAssinaturaDto) {
    return this.prisma.assinatura.update({
      where: { ID_Assinatura: id },
      data: {
        ID_Usuario: updateAssinaturaDto.idUsuario,
        ID_Plano: updateAssinaturaDto.idPlano,
        DataInicio:
          updateAssinaturaDto.dataInicio === undefined
            ? undefined
            : new Date(updateAssinaturaDto.dataInicio),
        DataFim:
          updateAssinaturaDto.dataFim === undefined
            ? undefined
            : new Date(updateAssinaturaDto.dataFim),
      },
    });
  }

  remove(id: number) {
    return this.prisma.assinatura.delete({ where: { ID_Assinatura: id } });
  }
}
