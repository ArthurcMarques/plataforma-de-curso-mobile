// Rotas HTTP de módulos que agrupam e ordenam as aulas. A política global de acesso verifica o perfil e a propriedade dos registros.
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ModuloService } from './modulo.service';
import { CreateModuloDto } from './dto/create-modulo.dto';
import { UpdateModuloDto } from './dto/update-modulo.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('modulo')
@Controller('modulo')
export class ModuloController {
  constructor(private readonly moduloService: ModuloService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo módulo' })
  @ApiResponse({ status: 201, description: 'Módulo criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() createModuloDto: CreateModuloDto) {
    return this.moduloService.create(createModuloDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os módulos' })
  findAll() {
    return this.moduloService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um módulo pelo ID' })
  findOne(@Param('id') id: string) {
    return this.moduloService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um módulo' })
  update(@Param('id') id: string, @Body() updateModuloDto: UpdateModuloDto) {
    return this.moduloService.update(+id, updateModuloDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um módulo' })
  remove(@Param('id') id: string) {
    return this.moduloService.remove(+id);
  }
}
