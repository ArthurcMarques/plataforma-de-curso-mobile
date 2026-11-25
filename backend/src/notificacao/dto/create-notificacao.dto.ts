// Contrato de entrada para notificações do usuário. Os decoradores são executados pelo ValidationPipe antes de chamar o serviço.
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNotificacaoDto {
  @IsInt()
  idUsuario!: number;

  @IsString()
  @IsNotEmpty()
  mensagem!: string;

  @IsOptional()
  @IsString()
  tipo?: string;
}
