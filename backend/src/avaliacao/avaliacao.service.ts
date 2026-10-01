import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';
import { UpdateAvaliacaoDto } from './dto/update-avaliacao.dto';

@Injectable()
export class AvaliacaoService {
  constructor(private readonly prisma: PrismaService) {}

  create(createAvaliacaoDto: CreateAvaliacaoDto) {
    return this.prisma.avaliacao.create({
      data: {
        ID_Usuario: createAvaliacaoDto.idUsuario,
        ID_Curso: createAvaliacaoDto.idCurso,
        Nota: createAvaliacaoDto.nota,
        Comentario: createAvaliacaoDto.comentario,
      },
    });
  }

  findAll() {
    return this.prisma.avaliacao.findMany();
  }

  findOne(id: number) {
    return this.prisma.avaliacao.findUnique({ where: { ID_Avaliacao: id } });
  }

  update(id: number, updateAvaliacaoDto: UpdateAvaliacaoDto) {
    return this.prisma.avaliacao.update({
      where: { ID_Avaliacao: id },
      data: {
        ID_Usuario: updateAvaliacaoDto.idUsuario,
        ID_Curso: updateAvaliacaoDto.idCurso,
        Nota: updateAvaliacaoDto.nota,
        Comentario: updateAvaliacaoDto.comentario,
      },
    });
  }

  remove(id: number) {
    return this.prisma.avaliacao.delete({ where: { ID_Avaliacao: id } });
  }
}
