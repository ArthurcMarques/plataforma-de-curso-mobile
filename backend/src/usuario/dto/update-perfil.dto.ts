// Contrato exclusivo da alteração de perfil; a autorização administrativa é verificada pelo guard.
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PerfilUsuario } from '../../generated/prisma/enums';

export class UpdatePerfilDto {
  @ApiProperty({ enum: PerfilUsuario })
  @IsEnum(PerfilUsuario)
  perfil!: PerfilUsuario;
}
