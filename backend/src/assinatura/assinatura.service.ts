import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssinaturaDto } from './dto/create-assinatura.dto';
import { UpdateAssinaturaDto } from './dto/update-assinatura.dto';

@Injectable()
export class AssinaturaService {
  constructor(private readonly prisma: PrismaService) {}

  create(createAssinaturaDto: CreateAssinaturaDto) {
    return this.prisma.assinatura.create({
      data: {
        ID_Usuario: createAssinaturaDto.idUsuario,
        ID_Plano: createAssinaturaDto.idPlano,
        DataInicio: new Date(createAssinaturaDto.dataInicio),
        DataFim: new Date(createAssinaturaDto.dataFim),
      },
    });
  }

  findAll() {
    return this.prisma.assinatura.findMany();
  }

  findOne(id: number) {
    return this.prisma.assinatura.findUnique({ where: { ID_Assinatura: id } });
  }

  update(id: number, updateAssinaturaDto: UpdateAssinaturaDto) {
    return this.prisma.assinatura.update({
      where: { ID_Assinatura: id },
      data: {
        ID_Usuario: updateAssinaturaDto.idUsuario,
        ID_Plano: updateAssinaturaDto.idPlano,
        DataInicio:
          updateAssinaturaDto.dataInicio === undefined
            ? undefined
            : new Date(updateAssinaturaDto.dataInicio),
        DataFim:
          updateAssinaturaDto.dataFim === undefined
            ? undefined
            : new Date(updateAssinaturaDto.dataFim),
      },
    });
  }

  remove(id: number) {
    return this.prisma.assinatura.delete({ where: { ID_Assinatura: id } });
  }
}
