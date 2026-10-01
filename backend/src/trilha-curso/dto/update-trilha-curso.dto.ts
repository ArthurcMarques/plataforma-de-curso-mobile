// Contrato de alteração de vínculos ordenados entre trilhas e cursos. PartialType torna opcionais os campos do cadastro e reaproveita seus validadores.
import { PartialType } from '@nestjs/swagger';
import { CreateTrilhaCursoDto } from './create-trilha-curso.dto';

export class UpdateTrilhaCursoDto extends PartialType(CreateTrilhaCursoDto) {}
