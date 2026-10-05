// Persistência de planos com preço e duração. Converte os DTOs da API para os campos do Prisma; a autorização HTTP fica em AccessPolicyService.
import { AccessPolicyService } from '../auth/access-policy.service';
import type { SessionUser } from '../auth/session-user';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanoDto } from './dto/create-plano.dto';
import { UpdatePlanoDto } from './dto/update-plano.dto';

@Injectable()
export class PlanoService {
  constructor(private readonly prisma: PrismaService, private readonly access: AccessPolicyService) {}

  create(createPlanoDto: CreatePlanoDto) {
    return this.prisma.plano.create({
      data: {
        Nome: createPlanoDto.nome,
        Descricao: createPlanoDto.descricao,
        Preco: createPlanoDto.preco,
        DuracaoMeses: createPlanoDto.duracaoMeses,
      },
    });
  }

  // O controller encaminha a sessão; a política aplica o escopo antes de consultar o Prisma.
  findAll(user: SessionUser) {
    return this.access.read('plano', user, {});
  }

  findOne(id: number, user: SessionUser) {
    return this.access.read('plano', user, { id: String(id) });
  }

  update(id: number, updatePlanoDto: UpdatePlanoDto) {
    return this.prisma.plano.update({
      where: { ID_Plano: id },
      data: {
        Nome: updatePlanoDto.nome,
        Descricao: updatePlanoDto.descricao,
        Preco: updatePlanoDto.preco,
        DuracaoMeses: updatePlanoDto.duracaoMeses,
      },
    });
  }

  remove(id: number) {
    return this.prisma.plano.delete({ where: { ID_Plano: id } });
  }
}
