// Contrato de alteração de assinaturas que vinculam usuários a planos e períodos de acesso. PartialType torna opcionais os campos do cadastro e reaproveita seus validadores.
import { PartialType } from '@nestjs/swagger';
import { CreateAssinaturaDto } from './create-assinatura.dto';

export class UpdateAssinaturaDto extends PartialType(CreateAssinaturaDto) {}
