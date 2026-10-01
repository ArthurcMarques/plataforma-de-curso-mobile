// Rotas HTTP de trilhas que organizam sequências de cursos. A política global de acesso verifica o perfil e a propriedade dos registros.
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TrilhaService } from './trilha.service';
import { CreateTrilhaDto } from './dto/create-trilha.dto';
import { UpdateTrilhaDto } from './dto/update-trilha.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('trilha')
@Controller('trilha')
export class TrilhaController {
  constructor(private readonly trilhaService: TrilhaService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova trilha' })
  @ApiResponse({ status: 201, description: 'Trilha criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() createTrilhaDto: CreateTrilhaDto) {
    return this.trilhaService.create(createTrilhaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as trilhas' })
  findAll() {
    return this.trilhaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma trilha pelo ID' })
  findOne(@Param('id') id: string) {
    return this.trilhaService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma trilha' })
  update(@Param('id') id: string, @Body() updateTrilhaDto: UpdateTrilhaDto) {
    return this.trilhaService.update(+id, updateTrilhaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma trilha' })
  remove(@Param('id') id: string) {
    return this.trilhaService.remove(+id);
  }
}
