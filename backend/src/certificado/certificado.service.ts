// Persistência de certificados emitidos para usuários e cursos. Converte os DTOs da API para os campos do Prisma; a autorização HTTP fica em AccessPolicyService.
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCertificadoDto } from './dto/create-certificado.dto';
import { UpdateCertificadoDto } from './dto/update-certificado.dto';

@Injectable()
export class CertificadoService {
  constructor(private readonly prisma: PrismaService) {}

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

  // Consulta sem filtro de perfil: no fluxo HTTP protegido, o guard/interceptor fornece a leitura com escopo.
  findAll() {
    return this.prisma.certificado.findMany();
  }

  findOne(id: number) {
    return this.prisma.certificado.findUnique({ where: { ID_Certificado: id } });
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
