// Persistência de contas de usuários e seus perfis de acesso. Converte os DTOs da API para os campos do Prisma; a autorização HTTP fica em AccessPolicyService.
import { AccessPolicyService } from '../auth/access-policy.service';
import type { SessionUser } from '../auth/session-user';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';
import { PerfilUsuario } from '../generated/prisma/enums';
import { KafkaProducerService } from '../messaging/kafka-producer.service';

@Injectable()
export class UsuarioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AccessPolicyService,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const perfil = createUsuarioDto.perfil ?? PerfilUsuario.ALUNO;
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(createUsuarioDto.password, salt);

    const usuario = await this.prisma.usuario.create({
      data: {
        NomeCompleto: createUsuarioDto.name,
        Email: createUsuarioDto.email,
        SenhaHash: hash,
        // Perfil e dados da conta são gravados na mesma inserção.
        Perfil: perfil,
        // Presente quando o app já pediu permissão de notificação antes do cadastro; permite o consumer
        // do Kafka enviar o push de boas-vindas já na primeira notificação, sem esperar um login futuro.
        PushToken: createUsuarioDto.pushToken,
      },
      omit: { SenhaHash: true },
    });

    // Nunca bloqueia nem falha o cadastro: o producer já absorve qualquer erro de conexão com o Kafka.
    void this.kafkaProducer.publishUsuarioCriado({
      idUsuario: usuario.ID_Usuario,
      nome: usuario.NomeCompleto,
      email: usuario.Email,
      dataCadastro: usuario.DataCadastro.toISOString(),
    });

    return usuario;
  }

  // Esta consulta interna inclui o hash para o login; não deve ser usada como resposta pública.
  async findByEmail(email: string) {
    return this.prisma.usuario.findUnique({
      where: { Email: email },
    });
  }

  // Consulta interna da autenticação: nunca devolve o hash da senha.
  findSessionUser(id: number) {
    return this.prisma.usuario.findUnique({ where: { ID_Usuario: id }, omit: { SenhaHash: true } });
  }

  async updatePerfil(id: number, perfil: PerfilUsuario) {
    const usuario = await this.prisma.usuario.update({
      where: { ID_Usuario: id }, data: { Perfil: perfil }, omit: { SenhaHash: true },
    });
    void this.kafkaProducer.publishPerfilAlterado({ idUsuario: id, perfil });
    return usuario;
  }

  // O controller encaminha a sessão; a política aplica o escopo antes de consultar o Prisma.
  findAll(user: SessionUser) {
    return this.access.read('usuario', user, {});
  }

  findOne(id: number, user: SessionUser) {
    return this.access.read('usuario', user, { id: String(id) });
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    let hash: string | undefined;
    // O hash só é recalculado quando uma senha foi enviada; ausência mantém a senha atual.
    if (updateUsuarioDto.password != null) {
      const salt = await bcrypt.genSalt();
      hash = await bcrypt.hash(updateUsuarioDto.password, salt);
    }

    return this.prisma.usuario.update({
      where: { ID_Usuario: id },
      data: {
        NomeCompleto: updateUsuarioDto.name,
        Email: updateUsuarioDto.email,
        SenhaHash: hash,
        PushToken: updateUsuarioDto.pushToken,
      },
      omit: { SenhaHash: true },
    });
  }

  // Chamado pelo login para manter o token de push atualizado a cada vez que o app abre com permissão concedida.
  updatePushToken(id: number, pushToken: string) {
    return this.prisma.usuario.update({ where: { ID_Usuario: id }, data: { PushToken: pushToken }, omit: { SenhaHash: true } });
  }

  remove(id: number) {
    return this.prisma.usuario.delete({
      where: { ID_Usuario: id },
      omit: { SenhaHash: true },
    });
  }
}
