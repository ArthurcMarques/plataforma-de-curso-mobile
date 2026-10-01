import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';

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
      },
      omit: { SenhaHash: true },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.usuario.findUnique({
      where: { Email: email },
    });
  }

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
