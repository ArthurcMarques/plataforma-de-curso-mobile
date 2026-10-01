// Rotas HTTP de conclusões de aulas identificadas pelo par usuário/aula. A política global de acesso verifica o perfil e a propriedade dos registros.
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProgressoAulaService } from './progresso-aula.service';
import { CreateProgressoAulaDto } from './dto/create-progresso-aula.dto';
import { UpdateProgressoAulaDto } from './dto/update-progresso-aula.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('progresso-aula')
@Controller('progresso-aula')
export class ProgressoAulaController {
  constructor(private readonly progressoAulaService: ProgressoAulaService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo progresso de aula' })
  @ApiResponse({ status: 201, description: 'Progresso de aula criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() createProgressoAulaDto: CreateProgressoAulaDto) {
    return this.progressoAulaService.create(createProgressoAulaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os progressos de aulas' })
  findAll() {
    return this.progressoAulaService.findAll();
  }

  @Get(':idUsuario/:idAula')
  @ApiOperation({ summary: 'Buscar o progresso de um usuário em uma aula' })
  findOne(
    @Param('idUsuario') idUsuario: string,
    @Param('idAula') idAula: string,
  ) {
    return this.progressoAulaService.findOne(+idUsuario, +idAula);
  }

  @Patch(':idUsuario/:idAula')
  @ApiOperation({ summary: 'Atualizar o progresso de um usuário em uma aula' })
  update(
    @Param('idUsuario') idUsuario: string,
    @Param('idAula') idAula: string,
    @Body() updateProgressoAulaDto: UpdateProgressoAulaDto,
  ) {
    return this.progressoAulaService.update(+idUsuario, +idAula, updateProgressoAulaDto);
  }

  @Delete(':idUsuario/:idAula')
  @ApiOperation({ summary: 'Remover o progresso de um usuário em uma aula' })
  remove(
    @Param('idUsuario') idUsuario: string,
    @Param('idAula') idAula: string,
  ) {
    return this.progressoAulaService.remove(+idUsuario, +idAula);
  }
}
