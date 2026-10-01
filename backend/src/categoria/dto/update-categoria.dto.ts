// Contrato de alteração de categorias que organizam cursos e trilhas. PartialType torna opcionais os campos do cadastro e reaproveita seus validadores.
import { PartialType } from '@nestjs/swagger';
import { CreateCategoriaDto } from './create-categoria.dto';

export class UpdateCategoriaDto extends PartialType(CreateCategoriaDto) {}
