// Persistência de conclusões de aulas identificadas pelo par usuário/aula. Converte os DTOs da API para os campos do Prisma; a autorização HTTP fica em AccessPolicyService.
import { AccessPolicyService } from '../auth/access-policy.service';
import type { SessionUser } from '../auth/session-user';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProgressoAulaDto } from './dto/create-progresso-aula.dto';
import { UpdateProgressoAulaDto } from './dto/update-progresso-aula.dto';

@Injectable()
export class ProgressoAulaService {
  constructor(private readonly prisma: PrismaService, private readonly access: AccessPolicyService) {}

  create(createProgressoAulaDto: CreateProgressoAulaDto) {
    return this.prisma.progressoAula.create({
      data: {
        ID_Usuario: createProgressoAulaDto.idUsuario,
        ID_Aula: createProgressoAulaDto.idAula,
        Status: createProgressoAulaDto.status,
        DataConclusao:
          createProgressoAulaDto.dataConclusao == null
            ? createProgressoAulaDto.dataConclusao
            : new Date(createProgressoAulaDto.dataConclusao),
      },
    });
  }

  // O controller encaminha a sessão; a política aplica o escopo antes de consultar o Prisma.
  findAll(user: SessionUser) {
    return this.access.read('progresso-aula', user, {});
  }

  // A chave composta exige os dois IDs; um deles sozinho não identifica o vínculo.
  findOne(idUsuario: number, idAula: number, user: SessionUser) {
    return this.access.read('progresso-aula', user, { idUsuario: String(idUsuario), idAula: String(idAula) });
  }

  update(
    idUsuario: number,
    idAula: number,
    updateProgressoAulaDto: UpdateProgressoAulaDto,
  ) {
    return this.prisma.progressoAula.update({
      where: { ID_Usuario_ID_Aula: { ID_Usuario: idUsuario, ID_Aula: idAula } },
      data: {
        ID_Usuario: updateProgressoAulaDto.idUsuario,
        ID_Aula: updateProgressoAulaDto.idAula,
        Status: updateProgressoAulaDto.status,
        DataConclusao:
          updateProgressoAulaDto.dataConclusao == null
            ? updateProgressoAulaDto.dataConclusao
            : new Date(updateProgressoAulaDto.dataConclusao),
      },
    });
  }

  remove(idUsuario: number, idAula: number) {
    return this.prisma.progressoAula.delete({
      where: { ID_Usuario_ID_Aula: { ID_Usuario: idUsuario, ID_Aula: idAula } },
    });
  }
}
