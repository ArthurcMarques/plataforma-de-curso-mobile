// Persistência de contas de usuários e seus perfis de acesso. Converte os DTOs da API para os campos do Prisma; a autorização HTTP fica em AccessPolicyService.
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';
import { PerfilUsuario } from '../generated/prisma/enums';

@Injectable()
export class UsuarioService {
  constructor(private readonly prisma: PrismaService) {}

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

  updatePerfil(id: number, perfil: PerfilUsuario) {
    return this.prisma.usuario.update({
      where: { ID_Usuario: id }, data: { Perfil: perfil }, omit: { SenhaHash: true },
    });
  }

  // Consulta sem filtro de perfil: no fluxo HTTP protegido, o guard/interceptor fornece a leitura com escopo.
  findAll() {
    return this.prisma.usuario.findMany({ omit: { SenhaHash: true } });
  }

  findOne(id: number) {
    return this.prisma.usuario.findUnique({
      where: { ID_Usuario: id },
      omit: { SenhaHash: true },
    });
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
