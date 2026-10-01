// Contrato de alteração de módulos que agrupam e ordenam as aulas. PartialType torna opcionais os campos do cadastro e reaproveita seus validadores.
import { PartialType } from '@nestjs/swagger';
import { CreateModuloDto } from './create-modulo.dto';

export class UpdateModuloDto extends PartialType(CreateModuloDto) {}
