import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MatriculaService } from './matricula.service';
import { CreateMatriculaDto } from './dto/create-matricula.dto';
import { UpdateMatriculaDto } from './dto/update-matricula.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('matricula')
@Controller('matricula')
export class MatriculaController {
  constructor(private readonly matriculaService: MatriculaService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova matrícula' })
  @ApiResponse({ status: 201, description: 'Matrícula criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() createMatriculaDto: CreateMatriculaDto) {
    return this.matriculaService.create(createMatriculaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as matrículas' })
  findAll() {
    return this.matriculaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma matrícula pelo ID' })
  findOne(@Param('id') id: string) {
    return this.matriculaService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma matrícula' })
  update(@Param('id') id: string, @Body() updateMatriculaDto: UpdateMatriculaDto) {
    return this.matriculaService.update(+id, updateMatriculaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma matrícula' })
  remove(@Param('id') id: string) {
    return this.matriculaService.remove(+id);
  }
}
