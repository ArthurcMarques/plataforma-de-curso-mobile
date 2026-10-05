// Rotas HTTP de contas de usuários e seus perfis de acesso. A política global de acesso verifica o perfil e a propriedade dos registros.
import type { AuthenticatedRequest } from '../auth/session-user';
import { Req, Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { Public } from '../auth/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('usuario')
@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Criar um novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioService.create(createUsuarioDto);
  }

  @ApiBearerAuth('token')
  @ApiResponse({ status: 401, description: 'Token ausente, inválido ou expirado.' })
  @ApiResponse({ status: 403, description: 'A alteração de perfil exige administrador.' })
  @Patch(':id/perfil')
  updatePerfil(@Param('id') id: string, @Body() dto: UpdatePerfilDto) {
    return this.usuarioService.updatePerfil(+id, dto.perfil);
  }

  @ApiBearerAuth('token')
  @Get()
  @ApiOperation({ summary: 'Listar todos os usuários' })
  findAll(@Req() request: AuthenticatedRequest) {
    return this.usuarioService.findAll(request.user);
  }

  @ApiBearerAuth('token')
  @Get(':id')
  @ApiOperation({ summary: 'Buscar um usuário pelo ID' })
  findOne(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.usuarioService.findOne(+id, request.user);
  }

  @ApiBearerAuth('token')
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um usuário' })
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuarioService.update(+id, updateUsuarioDto);
  }

  @ApiBearerAuth('token')
  @Delete(':id')
  @ApiOperation({ summary: 'Remover um usuário' })
  remove(@Param('id') id: string) {
    return this.usuarioService.remove(+id);
  }
}
