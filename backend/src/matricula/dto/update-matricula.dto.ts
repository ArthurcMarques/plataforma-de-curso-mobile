// Contrato de alteração de matrículas que vinculam usuários aos cursos. PartialType torna opcionais os campos do cadastro e reaproveita seus validadores.
import { PartialType } from '@nestjs/swagger';
import { CreateMatriculaDto } from './create-matricula.dto';

export class UpdateMatriculaDto extends PartialType(CreateMatriculaDto) {}
