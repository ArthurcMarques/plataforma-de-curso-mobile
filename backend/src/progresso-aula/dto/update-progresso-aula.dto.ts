// Contrato de alteração de conclusões de aulas identificadas pelo par usuário/aula. PartialType torna opcionais os campos do cadastro e reaproveita seus validadores.
import { PartialType } from '@nestjs/swagger';
import { CreateProgressoAulaDto } from './create-progresso-aula.dto';

export class UpdateProgressoAulaDto extends PartialType(CreateProgressoAulaDto) {}
