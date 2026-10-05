// Persistência de categorias que organizam cursos e trilhas. Converte os DTOs da API para os campos do Prisma; a autorização HTTP fica em AccessPolicyService.
import { AccessPolicyService } from '../auth/access-policy.service';
import type { SessionUser } from '../auth/session-user';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriaService {
  constructor(private readonly prisma: PrismaService, private readonly access: AccessPolicyService) {}

  create(createCategoriaDto: CreateCategoriaDto) {
    return this.prisma.categoria.create({
      data: {
        Nome: createCategoriaDto.nome,
        Descricao: createCategoriaDto.descricao,
      },
    });
  }

  // O controller encaminha a sessão; a política aplica o escopo antes de consultar o Prisma.
  findAll(user: SessionUser) {
    return this.access.read('categoria', user, {});
  }

  findOne(id: number, user: SessionUser) {
    return this.access.read('categoria', user, { id: String(id) });
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
