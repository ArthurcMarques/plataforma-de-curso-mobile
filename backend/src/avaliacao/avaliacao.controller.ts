import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AvaliacaoService } from './avaliacao.service';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';
import { UpdateAvaliacaoDto } from './dto/update-avaliacao.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('avaliacao')
@Controller('avaliacao')
export class AvaliacaoController {
  constructor(private readonly avaliacaoService: AvaliacaoService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova avaliação' })
  @ApiResponse({ status: 201, description: 'Avaliação criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() createAvaliacaoDto: CreateAvaliacaoDto) {
    return this.avaliacaoService.create(createAvaliacaoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as avaliações' })
  findAll() {
    return this.avaliacaoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma avaliação pelo ID' })
  findOne(@Param('id') id: string) {
    return this.avaliacaoService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma avaliação' })
  update(@Param('id') id: string, @Body() updateAvaliacaoDto: UpdateAvaliacaoDto) {
    return this.avaliacaoService.update(+id, updateAvaliacaoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma avaliação' })
  remove(@Param('id') id: string) {
    return this.avaliacaoService.remove(+id);
  }
}
