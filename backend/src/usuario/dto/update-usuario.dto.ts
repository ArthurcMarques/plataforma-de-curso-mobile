// Contrato de alteração de contas de usuários e seus perfis de acesso. PartialType torna opcionais os campos do cadastro e reaproveita seus validadores.
import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUsuarioDto } from './create-usuario.dto';

// A edição de perfil continua na rota administrativa específica.
export class UpdateUsuarioDto extends PartialType(OmitType(CreateUsuarioDto, ['perfil'] as const)) {}
