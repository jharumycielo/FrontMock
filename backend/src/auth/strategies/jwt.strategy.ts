import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: string;       // usuarioId
  sesionId: string;  // id de la sesión activa
  perfilId: string;  // perfil activo
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') as string,
    });
  }

  async validate(payload: JwtPayload) {
    // Verificar que la sesión no esté revocada
    const sesion = await this.prisma.usuarioSesion.findUnique({
      where: { id: payload.sesionId },
    });

    if (!sesion || sesion.revocadaEn !== null) {
      throw new UnauthorizedException('Sesión inválida o revocada');
    }

    if (sesion.expiraEn < new Date()) {
      throw new UnauthorizedException('Sesión expirada');
    }

    // Verificar que el usuario sigue activo
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
    });

    if (!usuario || usuario.estado !== 'activo') {
      throw new UnauthorizedException('Usuario inactivo o bloqueado');
    }

    return {
      usuarioId: payload.sub,
      sesionId: payload.sesionId,
      perfilId: payload.perfilId,
    };
  }
}
