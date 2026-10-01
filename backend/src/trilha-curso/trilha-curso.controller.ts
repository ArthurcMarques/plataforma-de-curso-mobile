// Rotas HTTP de vínculos ordenados entre trilhas e cursos. A política global de acesso verifica o perfil e a propriedade dos registros.
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TrilhaCursoService } from './trilha-curso.service';
import { CreateTrilhaCursoDto } from './dto/create-trilha-curso.dto';
import { UpdateTrilhaCursoDto } from './dto/update-trilha-curso.dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('trilha-curso')
@ApiBearerAuth('token')
@ApiResponse({ status: 401, description: 'Token ausente, inválido ou expirado.' })
@ApiResponse({ status: 403, description: 'Operação não permitida para este perfil.' })
@Controller('trilha-curso')
export class TrilhaCursoController {
  constructor(private readonly trilhaCursoService: TrilhaCursoService) {}

  @Post()
  @ApiOperation({ summary: 'Vincular um curso a uma trilha' })
  @ApiResponse({ status: 201, description: 'Curso vinculado à trilha com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() createTrilhaCursoDto: CreateTrilhaCursoDto) {
    return this.trilhaCursoService.create(createTrilhaCursoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os vínculos entre trilhas e cursos' })
  findAll() {
    return this.trilhaCursoService.findAll();
  }

  @Get(':idTrilha/:idCurso')
  @ApiOperation({ summary: 'Buscar o vínculo entre uma trilha e um curso' })
  findOne(
    @Param('idTrilha') idTrilha: string,
    @Param('idCurso') idCurso: string,
  ) {
    return this.trilhaCursoService.findOne(+idTrilha, +idCurso);
  }

  @Patch(':idTrilha/:idCurso')
  @ApiOperation({ summary: 'Atualizar o vínculo entre uma trilha e um curso' })
  update(
    @Param('idTrilha') idTrilha: string,
    @Param('idCurso') idCurso: string,
    @Body() updateTrilhaCursoDto: UpdateTrilhaCursoDto,
  ) {
    return this.trilhaCursoService.update(+idTrilha, +idCurso, updateTrilhaCursoDto);
  }

  @Delete(':idTrilha/:idCurso')
  @ApiOperation({ summary: 'Remover o vínculo entre uma trilha e um curso' })
  remove(
    @Param('idTrilha') idTrilha: string,
    @Param('idCurso') idCurso: string,
  ) {
    return this.trilhaCursoService.remove(+idTrilha, +idCurso);
  }
}
