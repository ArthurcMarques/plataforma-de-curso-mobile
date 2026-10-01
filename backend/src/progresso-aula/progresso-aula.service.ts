// Persistência de conclusões de aulas identificadas pelo par usuário/aula. Converte os DTOs da API para os campos do Prisma; a autorização HTTP fica em AccessPolicyService.
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProgressoAulaDto } from './dto/create-progresso-aula.dto';
import { UpdateProgressoAulaDto } from './dto/update-progresso-aula.dto';

@Injectable()
export class ProgressoAulaService {
  constructor(private readonly prisma: PrismaService) {}

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

  // Consulta sem filtro de perfil: no fluxo HTTP protegido, o guard/interceptor fornece a leitura com escopo.
  findAll() {
    return this.prisma.progressoAula.findMany();
  }

  // A chave composta exige os dois IDs; um deles sozinho não identifica o vínculo.
  findOne(idUsuario: number, idAula: number) {
    return this.prisma.progressoAula.findUnique({
      where: { ID_Usuario_ID_Aula: { ID_Usuario: idUsuario, ID_Aula: idAula } },
    });
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
