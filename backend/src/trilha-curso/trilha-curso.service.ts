// Persistência de vínculos ordenados entre trilhas e cursos. Converte os DTOs da API para os campos do Prisma; a autorização HTTP fica em AccessPolicyService.
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrilhaCursoDto } from './dto/create-trilha-curso.dto';
import { UpdateTrilhaCursoDto } from './dto/update-trilha-curso.dto';

@Injectable()
export class TrilhaCursoService {
  constructor(private readonly prisma: PrismaService) {}

  create(createTrilhaCursoDto: CreateTrilhaCursoDto) {
    return this.prisma.trilhaCurso.create({
      data: {
        ID_Trilha: createTrilhaCursoDto.idTrilha,
        ID_Curso: createTrilhaCursoDto.idCurso,
        Ordem: createTrilhaCursoDto.ordem,
      },
    });
  }

  // Consulta sem filtro de perfil: no fluxo HTTP protegido, o guard/interceptor fornece a leitura com escopo.
  findAll() {
    return this.prisma.trilhaCurso.findMany();
  }

  // A chave composta exige os dois IDs; um deles sozinho não identifica o vínculo.
  findOne(idTrilha: number, idCurso: number) {
    return this.prisma.trilhaCurso.findUnique({
      where: { ID_Trilha_ID_Curso: { ID_Trilha: idTrilha, ID_Curso: idCurso } },
    });
  }

  update(
    idTrilha: number,
    idCurso: number,
    updateTrilhaCursoDto: UpdateTrilhaCursoDto,
  ) {
    return this.prisma.trilhaCurso.update({
      where: { ID_Trilha_ID_Curso: { ID_Trilha: idTrilha, ID_Curso: idCurso } },
      data: {
        ID_Trilha: updateTrilhaCursoDto.idTrilha,
        ID_Curso: updateTrilhaCursoDto.idCurso,
        Ordem: updateTrilhaCursoDto.ordem,
      },
    });
  }

  remove(idTrilha: number, idCurso: number) {
    return this.prisma.trilhaCurso.delete({
      where: { ID_Trilha_ID_Curso: { ID_Trilha: idTrilha, ID_Curso: idCurso } },
    });
  }
}
