import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatriculaDto } from './dto/create-matricula.dto';
import { UpdateMatriculaDto } from './dto/update-matricula.dto';

@Injectable()
export class MatriculaService {
  constructor(private readonly prisma: PrismaService) {}

  create(createMatriculaDto: CreateMatriculaDto) {
    return this.prisma.matricula.create({
      data: {
        ID_Usuario: createMatriculaDto.idUsuario,
        ID_Curso: createMatriculaDto.idCurso,
        DataConclusao:
          createMatriculaDto.dataConclusao == null
            ? createMatriculaDto.dataConclusao
            : new Date(createMatriculaDto.dataConclusao),
      },
    });
  }

  findAll() {
    return this.prisma.matricula.findMany();
  }

  findOne(id: number) {
    return this.prisma.matricula.findUnique({ where: { ID_Matricula: id } });
  }

  update(id: number, updateMatriculaDto: UpdateMatriculaDto) {
    return this.prisma.matricula.update({
      where: { ID_Matricula: id },
      data: {
        ID_Usuario: updateMatriculaDto.idUsuario,
        ID_Curso: updateMatriculaDto.idCurso,
        DataConclusao:
          updateMatriculaDto.dataConclusao == null
            ? updateMatriculaDto.dataConclusao
            : new Date(updateMatriculaDto.dataConclusao),
      },
    });
  }

  remove(id: number) {
    return this.prisma.matricula.delete({ where: { ID_Matricula: id } });
  }
}
