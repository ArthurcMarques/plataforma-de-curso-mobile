// Rotas HTTP de planos com preço e duração. A política global de acesso verifica o perfil e a propriedade dos registros.
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PlanoService } from './plano.service';
import { CreatePlanoDto } from './dto/create-plano.dto';
import { UpdatePlanoDto } from './dto/update-plano.dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('plano')
@ApiBearerAuth('token')
@ApiResponse({ status: 401, description: 'Token ausente, inválido ou expirado.' })
@ApiResponse({ status: 403, description: 'Operação não permitida para este perfil.' })
@Controller('plano')
export class PlanoController {
  constructor(private readonly planoService: PlanoService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo plano' })
  @ApiResponse({ status: 201, description: 'Plano criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() createPlanoDto: CreatePlanoDto) {
    return this.planoService.create(createPlanoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os planos' })
  findAll() {
    return this.planoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um plano pelo ID' })
  findOne(@Param('id') id: string) {
    return this.planoService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um plano' })
  update(@Param('id') id: string, @Body() updatePlanoDto: UpdatePlanoDto) {
    return this.planoService.update(+id, updatePlanoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um plano' })
  remove(@Param('id') id: string) {
    return this.planoService.remove(+id);
  }
}
