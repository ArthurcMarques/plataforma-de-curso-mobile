// Persistência de cursos associados a categoria e instrutor. Converte os DTOs da API para os campos do Prisma; a autorização HTTP fica em AccessPolicyService.
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';

@Injectable()
export class CursoService {
  constructor(private readonly prisma: PrismaService) {}

  create(createCursoDto: CreateCursoDto) {
    return this.prisma.curso.create({
      data: {
        Titulo: createCursoDto.titulo,
        Descricao: createCursoDto.descricao,
        ID_Instrutor: createCursoDto.idInstrutor,
        ID_Categoria: createCursoDto.idCategoria,
        Nivel: createCursoDto.nivel,
        DataPublicacao:
          createCursoDto.dataPublicacao == null
            ? createCursoDto.dataPublicacao
            : new Date(createCursoDto.dataPublicacao),
        TotalAulas: createCursoDto.totalAulas,
        TotalHoras: createCursoDto.totalHoras,
      },
    });
  }

  // Consulta sem filtro de perfil: no fluxo HTTP protegido, o guard/interceptor fornece a leitura com escopo.
  findAll() {
    return this.prisma.curso.findMany();
  }

  findOne(id: number) {
    return this.prisma.curso.findUnique({ where: { ID_Curso: id } });
  }

  update(id: number, updateCursoDto: UpdateCursoDto) {
    return this.prisma.curso.update({
      where: { ID_Curso: id },
      data: {
        Titulo: updateCursoDto.titulo,
        Descricao: updateCursoDto.descricao,
        ID_Instrutor: updateCursoDto.idInstrutor,
        ID_Categoria: updateCursoDto.idCategoria,
        Nivel: updateCursoDto.nivel,
        DataPublicacao:
          updateCursoDto.dataPublicacao == null
            ? updateCursoDto.dataPublicacao
            : new Date(updateCursoDto.dataPublicacao),
        TotalAulas: updateCursoDto.totalAulas,
        TotalHoras: updateCursoDto.totalHoras,
      },
    });
  }

  remove(id: number) {
    return this.prisma.curso.delete({ where: { ID_Curso: id } });
  }
}
