// Contrato de alteração de trilhas que organizam sequências de cursos. PartialType torna opcionais os campos do cadastro e reaproveita seus validadores.
import { PartialType } from '@nestjs/swagger';
import { CreateTrilhaDto } from './create-trilha.dto';

export class UpdateTrilhaDto extends PartialType(CreateTrilhaDto) {}
