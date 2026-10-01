// Persistência de aulas vinculadas aos módulos do curso. Converte os DTOs da API para os campos do Prisma; a autorização HTTP fica em AccessPolicyService.
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAulaDto } from './dto/create-aula.dto';
import { UpdateAulaDto } from './dto/update-aula.dto';

@Injectable()
export class AulaService {
  constructor(private readonly prisma: PrismaService) {}

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

  // Consulta sem filtro de perfil: no fluxo HTTP protegido, o guard/interceptor fornece a leitura com escopo.
  findAll() {
    return this.prisma.aula.findMany();
  }

  findOne(id: number) {
    return this.prisma.aula.findUnique({ where: { ID_Aula: id } });
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
