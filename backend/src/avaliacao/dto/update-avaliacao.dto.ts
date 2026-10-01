// Contrato de alteração de avaliações de cursos com nota de 1 a 5 e comentário. PartialType torna opcionais os campos do cadastro e reaproveita seus validadores.
import { PartialType } from '@nestjs/swagger';
import { CreateAvaliacaoDto } from './create-avaliacao.dto';

export class UpdateAvaliacaoDto extends PartialType(CreateAvaliacaoDto) {}
