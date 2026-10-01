// Confere credenciais com bcrypt e emite o JWT usado nas próximas requisições.
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuarioService } from '../usuario/usuario.service';
import { LoginDto } from './dto/login.dto';

export interface JwtPayload {
  sub: number;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const usuario = await this.usuarioService.findByEmail(loginDto.email);

    if (!usuario || !(await bcrypt.compare(loginDto.password, usuario.SenhaHash))) {
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }

    const payload: JwtPayload = {
      sub: usuario.ID_Usuario,
      email: usuario.Email,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
