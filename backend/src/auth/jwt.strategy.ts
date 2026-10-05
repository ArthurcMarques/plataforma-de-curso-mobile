// Valida o token Bearer e resolve a identidade e o perfil atuais no banco.
import 'dotenv/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuarioService } from '../usuario/usuario.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usuarios: UsuarioService) {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET não definida');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate({ sub }: { sub: number }) {
    if (!Number.isInteger(sub)) throw new UnauthorizedException();
    const user = await this.usuarios.findSessionUser(sub);
    if (!user) throw new UnauthorizedException();
    // Consulta o banco em cada chamada: mudancas de perfil valem para tokens existentes.
    return { userId: user.ID_Usuario, email: user.Email, name: user.NomeCompleto, perfil: user.Perfil };
  }
}
