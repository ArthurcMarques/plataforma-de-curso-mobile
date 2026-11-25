// Validação das credenciais recebidas no login, antes da comparação do hash de senha.
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'joao@email.com', description: 'E-mail do usuário' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'senha123', description: 'Senha do usuário' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiPropertyOptional({ description: 'Token do Expo Push atual do dispositivo; atualiza o token salvo a cada login.' })
  @IsOptional()
  @IsString()
  pushToken?: string;
}
