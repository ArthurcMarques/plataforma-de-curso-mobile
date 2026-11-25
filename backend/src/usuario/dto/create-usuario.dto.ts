// Contrato de entrada para contas de usuários e seus perfis de acesso. Os decoradores são executados pelo ValidationPipe antes de chamar o serviço.
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';
import { PerfilUsuario } from '../../generated/prisma/enums';
export class CreateUsuarioDto {
  @ApiPropertyOptional({ enum: PerfilUsuario, default: 'ALUNO', description: 'Perfil escolhido no cadastro público.' })
  @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(PerfilUsuario)
  perfil?: PerfilUsuario;

  @ApiProperty({ example: 'joao@email.com', description: 'O email do usuário' })
  @IsEmail()
    email!: string;

  @ApiProperty({ example: 'João Silva', description: 'Nome completo' })
  @IsString()
    @IsNotEmpty()
    name!: string;
  @ApiProperty({
    example: 'senha123',
    description: 'Senha com no mínimo 6 caracteres',
    minLength: 6,
  })
  @IsString()
    @MinLength(6)
    password!: string;

  @ApiPropertyOptional({ description: 'Token do Expo Push, se o app já tiver permissão de notificação no cadastro.' })
  @IsOptional()
  @IsString()
  pushToken?: string;
}
