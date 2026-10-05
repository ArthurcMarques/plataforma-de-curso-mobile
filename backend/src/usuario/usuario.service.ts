// Persistência de contas de usuários e seus perfis de acesso. Converte os DTOs da API para os campos do Prisma; a autorização HTTP fica em AccessPolicyService.
import { AccessPolicyService } from '../auth/access-policy.service';
import type { SessionUser } from '../auth/session-user';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';
import { PerfilUsuario } from '../generated/prisma/enums';

@Injectable()
export class UsuarioService {
  constructor(private readonly prisma: PrismaService, private readonly access: AccessPolicyService) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(createUsuarioDto.password, salt);

    return this.prisma.usuario.create({
      data: {
        NomeCompleto: createUsuarioDto.name,
        Email: createUsuarioDto.email,
        SenhaHash: hash,
        // Cadastro público nunca aceita promoção de perfil enviada pelo cliente.
        Perfil: 'ALUNO',
      },
      omit: { SenhaHash: true },
    });
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

  updatePerfil(id: number, perfil: PerfilUsuario) {
    return this.prisma.usuario.update({
      where: { ID_Usuario: id }, data: { Perfil: perfil }, omit: { SenhaHash: true },
    });
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
      },
      omit: { SenhaHash: true },
    });
  }

  remove(id: number) {
    return this.prisma.usuario.delete({
      where: { ID_Usuario: id },
      omit: { SenhaHash: true },
    });
  }
}
