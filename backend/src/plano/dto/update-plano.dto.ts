// Contrato de alteração de planos com preço e duração. PartialType torna opcionais os campos do cadastro e reaproveita seus validadores.
import { PartialType } from '@nestjs/swagger';
import { CreatePlanoDto } from './create-plano.dto';

export class UpdatePlanoDto extends PartialType(CreatePlanoDto) {}
