// Persistência de certificados emitidos para usuários e cursos. Converte os DTOs da API para os campos do Prisma; a autorização HTTP fica em AccessPolicyService.
import { AccessPolicyService } from '../auth/access-policy.service';
import type { SessionUser } from '../auth/session-user';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCertificadoDto } from './dto/create-certificado.dto';
import { UpdateCertificadoDto } from './dto/update-certificado.dto';
import { KafkaProducerService } from '../messaging/kafka-producer.service';

@Injectable()
export class CertificadoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AccessPolicyService,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async create(createCertificadoDto: CreateCertificadoDto) {
    const certificado = await this.prisma.certificado.create({
      data: {
        ID_Usuario: createCertificadoDto.idUsuario,
        ID_Curso: createCertificadoDto.idCurso,
        ID_Trilha: createCertificadoDto.idTrilha,
        CodigoVerificacao: createCertificadoDto.codigoVerificacao,
      },
    });

    const curso = await this.prisma.curso.findUnique({ where: { ID_Curso: certificado.ID_Curso }, select: { Titulo: true } });
    void this.kafkaProducer.publishCertificadoEmitido({
      idUsuario: certificado.ID_Usuario,
      idCurso: certificado.ID_Curso,
      tituloCurso: curso?.Titulo ?? 'curso',
      codigoVerificacao: certificado.CodigoVerificacao,
    });

    return certificado;
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
