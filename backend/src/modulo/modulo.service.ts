// Persistência de módulos que agrupam e ordenam as aulas. Converte os DTOs da API para os campos do Prisma; a autorização HTTP fica em AccessPolicyService.
import { AccessPolicyService } from '../auth/access-policy.service';
import type { SessionUser } from '../auth/session-user';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuloDto } from './dto/create-modulo.dto';
import { UpdateModuloDto } from './dto/update-modulo.dto';

@Injectable()
export class ModuloService {
  constructor(private readonly prisma: PrismaService, private readonly access: AccessPolicyService) {}

  create(createModuloDto: CreateModuloDto) {
    return this.prisma.modulo.create({
      data: {
        ID_Curso: createModuloDto.idCurso,
        Titulo: createModuloDto.titulo,
        Ordem: createModuloDto.ordem,
      },
    });
  }

  // O controller encaminha a sessão; a política aplica o escopo antes de consultar o Prisma.
  findAll(user: SessionUser) {
    return this.access.read('modulo', user, {});
  }

  findOne(id: number, user: SessionUser) {
    return this.access.read('modulo', user, { id: String(id) });
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
