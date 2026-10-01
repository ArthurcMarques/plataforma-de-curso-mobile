// Persistência de planos com preço e duração. Converte os DTOs da API para os campos do Prisma; a autorização HTTP fica em AccessPolicyService.
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanoDto } from './dto/create-plano.dto';
import { UpdatePlanoDto } from './dto/update-plano.dto';

@Injectable()
export class PlanoService {
  constructor(private readonly prisma: PrismaService) {}

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

  // Consulta sem filtro de perfil: no fluxo HTTP protegido, o guard/interceptor fornece a leitura com escopo.
  findAll() {
    return this.prisma.plano.findMany();
  }

  findOne(id: number) {
    return this.prisma.plano.findUnique({ where: { ID_Plano: id } });
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
