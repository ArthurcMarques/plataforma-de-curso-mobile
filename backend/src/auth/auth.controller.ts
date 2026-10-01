// Expõe o login e os dados da sessão autenticada.
import { Body, Controller, Get, Req, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Public } from './public.decorator';
import type { SessionUser } from './session-user';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticar usuário e gerar token JWT' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso.' })
  @ApiResponse({ status: 401, description: 'E-mail ou senha incorretos.' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiBearerAuth('token')
  @ApiResponse({ status: 401, description: 'Token ausente, inválido ou expirado.' })
  @Get('me')
  me(@Req() request: { user: SessionUser }) {
    return request.user;
  }
}
