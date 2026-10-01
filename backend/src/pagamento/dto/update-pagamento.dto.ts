// Contrato de alteração de pagamentos associados às assinaturas. PartialType torna opcionais os campos do cadastro e reaproveita seus validadores.
import { PartialType } from '@nestjs/swagger';
import { CreatePagamentoDto } from './create-pagamento.dto';

export class UpdatePagamentoDto extends PartialType(CreatePagamentoDto) {}
