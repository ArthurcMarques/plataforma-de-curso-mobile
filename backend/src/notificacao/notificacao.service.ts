// Persistência de notificações do usuário. Converte os DTOs da API para os campos do Prisma; a autorização HTTP fica em AccessPolicyService.
import { AccessPolicyService } from '../auth/access-policy.service';
import type { SessionUser } from '../auth/session-user';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificacaoDto } from './dto/create-notificacao.dto';
import { UpdateNotificacaoDto } from './dto/update-notificacao.dto';

@Injectable()
export class NotificacaoService {
  constructor(private readonly prisma: PrismaService, private readonly access: AccessPolicyService) {}

  create(createNotificacaoDto: CreateNotificacaoDto) {
    return this.prisma.notificacao.create({
      data: {
        ID_Usuario: createNotificacaoDto.idUsuario,
        Mensagem: createNotificacaoDto.mensagem,
        Tipo: createNotificacaoDto.tipo,
      },
    });
  }

  // O controller encaminha a sessão; a política aplica o escopo antes de consultar o Prisma.
  findAll(user: SessionUser) {
    return this.access.read('notificacao', user, {});
  }

  findOne(id: number, user: SessionUser) {
    return this.access.read('notificacao', user, { id: String(id) });
  }

  update(id: number, updateNotificacaoDto: UpdateNotificacaoDto) {
    return this.prisma.notificacao.update({
      where: { ID_Notificacao: id },
      data: {
        ID_Usuario: updateNotificacaoDto.idUsuario,
        Mensagem: updateNotificacaoDto.mensagem,
        Tipo: updateNotificacaoDto.tipo,
      },
    });
  }

  remove(id: number) {
    return this.prisma.notificacao.delete({ where: { ID_Notificacao: id } });
  }
}
