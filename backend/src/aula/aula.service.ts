// Persistência de aulas vinculadas aos módulos do curso. Converte os DTOs da API para os campos do Prisma; a autorização HTTP fica em AccessPolicyService.
import { AccessPolicyService } from '../auth/access-policy.service';
import type { SessionUser } from '../auth/session-user';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAulaDto } from './dto/create-aula.dto';
import { UpdateAulaDto } from './dto/update-aula.dto';

@Injectable()
export class AulaService {
  constructor(private readonly prisma: PrismaService, private readonly access: AccessPolicyService) {}

  create(createAulaDto: CreateAulaDto) {
    return this.prisma.aula.create({
      data: {
        ID_Modulo: createAulaDto.idModulo,
        Titulo: createAulaDto.titulo,
        TipoConteudo: createAulaDto.tipoConteudo,
        URL_Conteudo: createAulaDto.urlConteudo,
        DuracaoMinutos: createAulaDto.duracaoMinutos,
        Ordem: createAulaDto.ordem,
      },
    });
  }

  // O controller encaminha a sessão; a política aplica o escopo antes de consultar o Prisma.
  findAll(user: SessionUser) {
    return this.access.read('aula', user, {});
  }

  findOne(id: number, user: SessionUser) {
    return this.access.read('aula', user, { id: String(id) });
  }

  update(id: number, updateAulaDto: UpdateAulaDto) {
    return this.prisma.aula.update({
      where: { ID_Aula: id },
      data: {
        ID_Modulo: updateAulaDto.idModulo,
        Titulo: updateAulaDto.titulo,
        TipoConteudo: updateAulaDto.tipoConteudo,
        URL_Conteudo: updateAulaDto.urlConteudo,
        DuracaoMinutos: updateAulaDto.duracaoMinutos,
        Ordem: updateAulaDto.ordem,
      },
    });
  }

  remove(id: number) {
    return this.prisma.aula.delete({ where: { ID_Aula: id } });
  }
}
