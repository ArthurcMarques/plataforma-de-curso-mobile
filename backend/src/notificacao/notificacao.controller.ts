// Rotas HTTP de notificações do usuário. A política global de acesso verifica o perfil e a propriedade dos registros.
import type { AuthenticatedRequest } from '../auth/session-user';
import { Req, Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NotificacaoService } from './notificacao.service';
import { CreateNotificacaoDto } from './dto/create-notificacao.dto';
import { UpdateNotificacaoDto } from './dto/update-notificacao.dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('notificacao')
@ApiBearerAuth('token')
@ApiResponse({ status: 401, description: 'Token ausente, inválido ou expirado.' })
@ApiResponse({ status: 403, description: 'Operação não permitida para este perfil.' })
@Controller('notificacao')
export class NotificacaoController {
  constructor(private readonly notificacaoService: NotificacaoService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova notificação' })
  @ApiResponse({ status: 201, description: 'Notificação criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() createNotificacaoDto: CreateNotificacaoDto) {
    return this.notificacaoService.create(createNotificacaoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar as notificações do usuário' })
  findAll(@Req() request: AuthenticatedRequest) {
    return this.notificacaoService.findAll(request.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma notificação pelo ID' })
  findOne(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.notificacaoService.findOne(+id, request.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma notificação' })
  update(@Param('id') id: string, @Body() updateNotificacaoDto: UpdateNotificacaoDto) {
    return this.notificacaoService.update(+id, updateNotificacaoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma notificação' })
  remove(@Param('id') id: string) {
    return this.notificacaoService.remove(+id);
  }
}
