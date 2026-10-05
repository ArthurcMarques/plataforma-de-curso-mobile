// Persistência de certificados emitidos para usuários e cursos. Converte os DTOs da API para os campos do Prisma; a autorização HTTP fica em AccessPolicyService.
import { AccessPolicyService } from '../auth/access-policy.service';
import type { SessionUser } from '../auth/session-user';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCertificadoDto } from './dto/create-certificado.dto';
import { UpdateCertificadoDto } from './dto/update-certificado.dto';

@Injectable()
export class CertificadoService {
  constructor(private readonly prisma: PrismaService, private readonly access: AccessPolicyService) {}

  create(createCertificadoDto: CreateCertificadoDto) {
    return this.prisma.certificado.create({
      data: {
        ID_Usuario: createCertificadoDto.idUsuario,
        ID_Curso: createCertificadoDto.idCurso,
        ID_Trilha: createCertificadoDto.idTrilha,
        CodigoVerificacao: createCertificadoDto.codigoVerificacao,
      },
    });
  }

  // O controller encaminha a sessão; a política aplica o escopo antes de consultar o Prisma.
  findAll(user: SessionUser) {
    return this.access.read('certificado', user, {});
  }

  findOne(id: number, user: SessionUser) {
    return this.access.read('certificado', user, { id: String(id) });
  }

  update(id: number, updateCertificadoDto: UpdateCertificadoDto) {
    return this.prisma.certificado.update({
      where: { ID_Certificado: id },
      data: {
        ID_Usuario: updateCertificadoDto.idUsuario,
        ID_Curso: updateCertificadoDto.idCurso,
        ID_Trilha: updateCertificadoDto.idTrilha,
        CodigoVerificacao: updateCertificadoDto.codigoVerificacao,
      },
    });
  }

  remove(id: number) {
    return this.prisma.certificado.delete({ where: { ID_Certificado: id } });
  }
}
