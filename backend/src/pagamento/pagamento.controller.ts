import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PagamentoService } from './pagamento.service';
import { CreatePagamentoDto } from './dto/create-pagamento.dto';
import { UpdatePagamentoDto } from './dto/update-pagamento.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('pagamento')
@Controller('pagamento')
export class PagamentoController {
  constructor(private readonly pagamentoService: PagamentoService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo pagamento' })
  @ApiResponse({ status: 201, description: 'Pagamento criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() createPagamentoDto: CreatePagamentoDto) {
    return this.pagamentoService.create(createPagamentoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os pagamentos' })
  findAll() {
    return this.pagamentoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um pagamento pelo ID' })
  findOne(@Param('id') id: string) {
    return this.pagamentoService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um pagamento' })
  update(@Param('id') id: string, @Body() updatePagamentoDto: UpdatePagamentoDto) {
    return this.pagamentoService.update(+id, updatePagamentoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um pagamento' })
  remove(@Param('id') id: string) {
    return this.pagamentoService.remove(+id);
  }
}
