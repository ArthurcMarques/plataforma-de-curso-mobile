// Contrato de entrada para contas de usuários e seus perfis de acesso. Os decoradores são executados pelo ValidationPipe antes de chamar o serviço.
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
export class CreateUsuarioDto {
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
}
