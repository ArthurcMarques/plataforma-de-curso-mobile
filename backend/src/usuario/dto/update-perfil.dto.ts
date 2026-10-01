import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PerfilUsuario } from '../../generated/prisma/enums';

export class UpdatePerfilDto {
  @ApiProperty({ enum: PerfilUsuario })
  @IsEnum(PerfilUsuario)
  perfil!: PerfilUsuario;
}
