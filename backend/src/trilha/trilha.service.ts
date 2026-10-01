// Persistência de trilhas que organizam sequências de cursos. Converte os DTOs da API para os campos do Prisma; a autorização HTTP fica em AccessPolicyService.
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrilhaDto } from './dto/create-trilha.dto';
import { UpdateTrilhaDto } from './dto/update-trilha.dto';

@Injectable()
export class TrilhaService {
  constructor(private readonly prisma: PrismaService) {}

  create(createTrilhaDto: CreateTrilhaDto) {
    return this.prisma.trilha.create({
      data: {
        Titulo: createTrilhaDto.titulo,
        Descricao: createTrilhaDto.descricao,
        ID_Categoria: createTrilhaDto.idCategoria,
      },
    });
  }

  // Consulta sem filtro de perfil: no fluxo HTTP protegido, o guard/interceptor fornece a leitura com escopo.
  findAll() {
    return this.prisma.trilha.findMany();
  }

  findOne(id: number) {
    return this.prisma.trilha.findUnique({ where: { ID_Trilha: id } });
  }

  update(id: number, updateTrilhaDto: UpdateTrilhaDto) {
    return this.prisma.trilha.update({
      where: { ID_Trilha: id },
      data: {
        Titulo: updateTrilhaDto.titulo,
        Descricao: updateTrilhaDto.descricao,
        ID_Categoria: updateTrilhaDto.idCategoria,
      },
    });
  }

  remove(id: number) {
    return this.prisma.trilha.delete({ where: { ID_Trilha: id } });
  }
}
