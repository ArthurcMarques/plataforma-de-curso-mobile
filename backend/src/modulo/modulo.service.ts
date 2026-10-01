import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuloDto } from './dto/create-modulo.dto';
import { UpdateModuloDto } from './dto/update-modulo.dto';

@Injectable()
export class ModuloService {
  constructor(private readonly prisma: PrismaService) {}

  create(createModuloDto: CreateModuloDto) {
    return this.prisma.modulo.create({
      data: {
        ID_Curso: createModuloDto.idCurso,
        Titulo: createModuloDto.titulo,
        Ordem: createModuloDto.ordem,
      },
    });
  }

  findAll() {
    return this.prisma.modulo.findMany();
  }

  findOne(id: number) {
    return this.prisma.modulo.findUnique({ where: { ID_Modulo: id } });
  }

  update(id: number, updateModuloDto: UpdateModuloDto) {
    return this.prisma.modulo.update({
      where: { ID_Modulo: id },
      data: {
        ID_Curso: updateModuloDto.idCurso,
        Titulo: updateModuloDto.titulo,
        Ordem: updateModuloDto.ordem,
      },
    });
  }

  remove(id: number) {
    return this.prisma.modulo.delete({ where: { ID_Modulo: id } });
  }
}
