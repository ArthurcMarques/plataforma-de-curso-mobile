// Persistência de matrículas que vinculam usuários aos cursos. Converte os DTOs da API para os campos do Prisma; a autorização HTTP fica em AccessPolicyService.
import { AccessPolicyService } from '../auth/access-policy.service';
import type { SessionUser } from '../auth/session-user';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatriculaDto } from './dto/create-matricula.dto';
import { UpdateMatriculaDto } from './dto/update-matricula.dto';

@Injectable()
export class MatriculaService {
  constructor(private readonly prisma: PrismaService, private readonly access: AccessPolicyService) {}

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

  // O controller encaminha a sessão; a política aplica o escopo antes de consultar o Prisma.
  findAll(user: SessionUser) {
    return this.access.read('matricula', user, {});
  }

  findOne(id: number, user: SessionUser) {
    return this.access.read('matricula', user, { id: String(id) });
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
