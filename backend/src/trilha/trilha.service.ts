// Persistência de trilhas que organizam sequências de cursos. Converte os DTOs da API para os campos do Prisma; a autorização HTTP fica em AccessPolicyService.
import { AccessPolicyService } from '../auth/access-policy.service';
import type { SessionUser } from '../auth/session-user';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrilhaDto } from './dto/create-trilha.dto';
import { UpdateTrilhaDto } from './dto/update-trilha.dto';

@Injectable()
export class TrilhaService {
  constructor(private readonly prisma: PrismaService, private readonly access: AccessPolicyService) {}

  create(createTrilhaDto: CreateTrilhaDto) {
    return this.prisma.trilha.create({
      data: {
        Titulo: createTrilhaDto.titulo,
        Descricao: createTrilhaDto.descricao,
        ID_Categoria: createTrilhaDto.idCategoria,
      },
    });
  }

  // O controller encaminha a sessão; a política aplica o escopo antes de consultar o Prisma.
  findAll(user: SessionUser) {
    return this.access.read('trilha', user, {});
  }

  findOne(id: number, user: SessionUser) {
    return this.access.read('trilha', user, { id: String(id) });
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
