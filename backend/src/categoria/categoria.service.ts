// Persistência de categorias que organizam cursos e trilhas. Converte os DTOs da API para os campos do Prisma; a autorização HTTP fica em AccessPolicyService.
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriaService {
  constructor(private readonly prisma: PrismaService) {}

  create(createCategoriaDto: CreateCategoriaDto) {
    return this.prisma.categoria.create({
      data: {
        Nome: createCategoriaDto.nome,
        Descricao: createCategoriaDto.descricao,
      },
    });
  }

  // Consulta sem filtro de perfil: no fluxo HTTP protegido, o guard/interceptor fornece a leitura com escopo.
  findAll() {
    return this.prisma.categoria.findMany();
  }

  findOne(id: number) {
    return this.prisma.categoria.findUnique({ where: { ID_Categoria: id } });
  }

  update(id: number, updateCategoriaDto: UpdateCategoriaDto) {
    return this.prisma.categoria.update({
      where: { ID_Categoria: id },
      data: {
        Nome: updateCategoriaDto.nome,
        Descricao: updateCategoriaDto.descricao,
      },
    });
  }

  remove(id: number) {
    return this.prisma.categoria.delete({ where: { ID_Categoria: id } });
  }
}
