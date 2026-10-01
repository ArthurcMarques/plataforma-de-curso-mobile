// Rotas HTTP de certificados emitidos para usuários e cursos. A política global de acesso verifica o perfil e a propriedade dos registros.
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CertificadoService } from './certificado.service';
import { CreateCertificadoDto } from './dto/create-certificado.dto';
import { UpdateCertificadoDto } from './dto/update-certificado.dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('certificado')
@ApiBearerAuth('token')
@ApiResponse({ status: 401, description: 'Token ausente, inválido ou expirado.' })
@ApiResponse({ status: 403, description: 'Operação não permitida para este perfil.' })
@Controller('certificado')
export class CertificadoController {
  constructor(private readonly certificadoService: CertificadoService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo certificado' })
  @ApiResponse({ status: 201, description: 'Certificado criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() createCertificadoDto: CreateCertificadoDto) {
    return this.certificadoService.create(createCertificadoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os certificados' })
  findAll() {
    return this.certificadoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um certificado pelo ID' })
  findOne(@Param('id') id: string) {
    return this.certificadoService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um certificado' })
  update(@Param('id') id: string, @Body() updateCertificadoDto: UpdateCertificadoDto) {
    return this.certificadoService.update(+id, updateCertificadoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um certificado' })
  remove(@Param('id') id: string) {
    return this.certificadoService.remove(+id);
  }
}
