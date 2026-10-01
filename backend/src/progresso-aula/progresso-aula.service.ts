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

  findAll() {
    return this.prisma.progressoAula.findMany();
  }

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
