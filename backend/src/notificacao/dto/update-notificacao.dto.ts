// Contrato de alteração de notificações do usuário. PartialType torna opcionais os campos do cadastro e reaproveita seus validadores.
import { PartialType } from '@nestjs/swagger';
import { CreateNotificacaoDto } from './create-notificacao.dto';

export class UpdateNotificacaoDto extends PartialType(CreateNotificacaoDto) {}
