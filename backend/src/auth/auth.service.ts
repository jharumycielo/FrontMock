import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { LoginDto } from './dto/login.dto';
import { CambiarPasswordDto } from './dto/cambiar-password.dto';
import { CambiarPerfilDto } from './dto/cambiar-perfil.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mailer: MailerService,
    private readonly whatsapp: WhatsappService,
  ) {}

  // ─────────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────────
  async login(dto: LoginDto, ip?: string, userAgent?: string) {
    // 1. Buscar usuario por DNI
    const usuario = await this.prisma.usuario.findUnique({
      where: { dni: dto.dni },
    });

    // Siempre el mismo mensaje — no revelar si el DNI existe
    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // 2. Verificar estado
    if (usuario.estado === 'bloqueado') {
      throw new ForbiddenException('Cuenta bloqueada. Contacte al administrador');
    }
    if (usuario.estado === 'inactivo') {
      throw new ForbiddenException('Cuenta inactiva. Contacte al administrador');
    }
    if (usuario.estado === 'pendiente_activacion') {
      throw new ForbiddenException('Debe activar su cuenta primero');
    }

    // 3. Verificar password
    const passwordValido = await bcrypt.compare(dto.password, usuario.passwordHash);
    if (!passwordValido) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // 4. Cargar perfiles activos
    const perfiles = await this.prisma.usuarioEntidadRol.findMany({
      where: {
        usuarioId: usuario.id,
        esActivo: true,
        OR: [
          { fechaFin: null },
          { fechaFin: { gte: new Date() } },
        ],
      },
      include: {
        entidadPublica: { select: { id: true, nombre: true, codigo: true } },
        unidadOrganica: { select: { id: true, nombre: true, codigo: true } },
        rol: { select: { id: true, nombre: true, codigo: true } },
      },
    });

    if (perfiles.length === 0) {
      throw new ForbiddenException('Sin acceso asignado. Contacte al administrador');
    }

    // 5. Seleccionar perfil activo — principal primero, si no el primero
    const perfilActivo = perfiles.find(p => p.esPrincipal) ?? perfiles[0];

    // 6. Crear sesión
    const refreshTokenRaw = crypto.randomUUID();
    const refreshTokenHash = await bcrypt.hash(refreshTokenRaw, 10);
    const expiraEn = new Date();
    expiraEn.setDate(expiraEn.getDate() + 7); // 7 días

    const sesion = await this.prisma.usuarioSesion.create({
      data: {
        usuarioId: usuario.id,
        perfilActivoId: perfilActivo.id,
        refreshTokenHash,
        ip: ip ?? null,
        userAgent: userAgent ?? null,
        expiraEn,
      },
    });

    // 7. Actualizar ultimo acceso
    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoAcceso: new Date() },
    });

    // 8. Registrar en auditoría
    await this.prisma.auditoriaEvento.create({
      data: {
        usuarioId: usuario.id,
        perfilId: perfilActivo.id,
        entidadPublicaId: perfilActivo.entidadPublicaId,
        unidadOrganicaId: perfilActivo.unidadOrganicaId,
        accion: 'usuario.login',
        ip: ip ?? null,
        userAgent: userAgent ?? null,
      },
    });

    // 9. Generar tokens
    const payload: JwtPayload = {
      sub: usuario.id,
      sesionId: sesion.id,
      perfilId: perfilActivo.id,
    };

    const accessToken = this.jwt.sign(payload, {
      expiresIn: this.config.get('JWT_EXPIRES_IN') ?? '15m',
    });

    return {
      accessToken,
      refreshToken: refreshTokenRaw,
      debeCambiarPassword: usuario.debeCambiarPassword,
      perfilActivo: {
        id: perfilActivo.id,
        entidad: perfilActivo.entidadPublica.nombre,
        entidadId: perfilActivo.entidadPublica.id,
        unidad: perfilActivo.unidadOrganica?.nombre ?? null,
        unidadId: perfilActivo.unidadOrganica?.id ?? null,
        rol: perfilActivo.rol.nombre,
        rolCodigo: perfilActivo.rol.codigo,
        ambito: perfilActivo.ambito,
      },
      perfilesDisponibles: perfiles.map(p => ({
        id: p.id,
        entidad: p.entidadPublica.nombre,
        unidad: p.unidadOrganica?.nombre ?? null,
        rol: p.rol.nombre,
        rolCodigo: p.rol.codigo,
        ambito: p.ambito,
        esPrincipal: p.esPrincipal,
      })),
    };
  }

  // ─────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────
  async logout(sesionId: string, usuarioId: string) {
    await this.prisma.usuarioSesion.update({
      where: { id: sesionId },
      data: { revocadaEn: new Date() },
    });

    await this.prisma.auditoriaEvento.create({
      data: {
        usuarioId,
        accion: 'usuario.logout',
      },
    });

    return { message: 'Sesión cerrada correctamente' };
  }

  // ─────────────────────────────────────────────
  // REFRESH TOKEN
  // ─────────────────────────────────────────────
  async refresh(sesionId: string, refreshTokenRaw: string) {
    const sesion = await this.prisma.usuarioSesion.findUnique({
      where: { id: sesionId },
    });

    if (!sesion || sesion.revocadaEn !== null) {
      throw new UnauthorizedException('Sesión inválida');
    }

    if (sesion.expiraEn < new Date()) {
      throw new UnauthorizedException('Refresh token expirado. Inicie sesión nuevamente');
    }

    const tokenValido = await bcrypt.compare(refreshTokenRaw, sesion.refreshTokenHash);
    if (!tokenValido) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const payload: JwtPayload = {
      sub: sesion.usuarioId,
      sesionId: sesion.id,
      perfilId: sesion.perfilActivoId!,
    };

    const accessToken = this.jwt.sign(payload, {
      expiresIn: this.config.get('JWT_EXPIRES_IN') ?? '15m',
    });

    return { accessToken };
  }

  // ─────────────────────────────────────────────
  // CAMBIAR PASSWORD
  // ─────────────────────────────────────────────
  async cambiarPassword(usuarioId: string, sesionId: string, dto: CambiarPasswordDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const passwordValido = await bcrypt.compare(dto.passwordActual, usuario.passwordHash);
    if (!passwordValido) {
      throw new BadRequestException('El password actual es incorrecto');
    }

    if (dto.passwordActual === dto.passwordNuevo) {
      throw new BadRequestException('El nuevo password debe ser diferente al actual');
    }

    const nuevoHash = await bcrypt.hash(dto.passwordNuevo, 10);

    await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        passwordHash: nuevoHash,
        debeCambiarPassword: false,
      },
    });

    // Revocar sesión actual — debe hacer login de nuevo con el nuevo password
    await this.prisma.usuarioSesion.update({
      where: { id: sesionId },
      data: { revocadaEn: new Date() },
    });

    await this.prisma.auditoriaEvento.create({
      data: {
        usuarioId,
        accion: 'usuario.cambio_password',
      },
    });

    return { message: 'Password actualizado. Inicie sesión nuevamente' };
  }

  // ─────────────────────────────────────────────
  // CAMBIAR PERFIL ACTIVO
  // ─────────────────────────────────────────────
  async cambiarPerfil(usuarioId: string, sesionId: string, dto: CambiarPerfilDto) {
    // Verificar que el perfil pertenece al usuario
    const perfil = await this.prisma.usuarioEntidadRol.findFirst({
      where: {
        id: dto.perfilId,
        usuarioId,
        esActivo: true,
      },
      include: {
        entidadPublica: { select: { id: true, nombre: true } },
        unidadOrganica: { select: { id: true, nombre: true } },
        rol: { select: { id: true, nombre: true, codigo: true } },
      },
    });

    if (!perfil) {
      throw new ForbiddenException('Perfil no encontrado o no pertenece a este usuario');
    }

    // Actualizar perfil activo en la sesión
    await this.prisma.usuarioSesion.update({
      where: { id: sesionId },
      data: { perfilActivoId: dto.perfilId },
    });

    // Generar nuevo access token con el nuevo perfil
    const payload: JwtPayload = {
      sub: usuarioId,
      sesionId,
      perfilId: dto.perfilId,
    };

    const accessToken = this.jwt.sign(payload, {
      expiresIn: this.config.get('JWT_EXPIRES_IN') ?? '15m',
    });

    return {
      accessToken,
      perfilActivo: {
        id: perfil.id,
        entidad: perfil.entidadPublica.nombre,
        entidadId: perfil.entidadPublica.id,
        unidad: perfil.unidadOrganica?.nombre ?? null,
        unidadId: perfil.unidadOrganica?.id ?? null,
        rol: perfil.rol.nombre,
        rolCodigo: perfil.rol.codigo,
        ambito: perfil.ambito,
      },
    };
  }

  // ─────────────────────────────────────────────
  // SOLICITAR OTP
  // ─────────────────────────────────────────────
  async solicitarOtp(email: string) {
    // Verificar que el usuario existe
    const usuario = await this.prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      // No revelar si el email existe — responder igual
      return { message: 'Si el email existe, recibirás un código en breve' };
    }

    if (usuario.estado !== 'activo') {
      throw new ForbiddenException('La cuenta no está activa');
    }

    // Generar código de 4 dígitos
    const codigo = String(Math.floor(1000 + Math.random() * 9000));

    // Expiración: 10 minutos
    const expiraEn = new Date();
    expiraEn.setMinutes(expiraEn.getMinutes() + 10);

    // Invalidar OTPs anteriores del mismo email
    await this.prisma.otpVerificacion.updateMany({
      where: { email, usadoEn: null },
      data: { usadoEn: new Date() },
    });

    // Guardar nuevo OTP
    await this.prisma.otpVerificacion.create({
      data: { email, codigo, expiraEn },
    });

    // Enviar email
    try {
      await this.mailer.sendMail({
        to: email,
        subject: 'Código de verificación SIAF-RP',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
            <div style="background: #1a56db; padding: 15px; border-radius: 6px; text-align: center;">
              <h2 style="color: white; margin: 0;">SIAF-RP</h2>
            </div>
            <div style="padding: 20px; background: #f9f9f9; border-radius: 0 0 6px 6px;">
              <p>Su código de verificación es:</p>
              <div style="text-align: center; margin: 20px 0;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #1a56db;">
                  ${codigo}
                </span>
              </div>
              <p style="color: #666; font-size: 12px;">
                Este código expira en 10 minutos.<br>
                Si no solicitó este código, ignore este mensaje.
              </p>
            </div>
          </div>
        `,
      });
    } catch (error) {
      throw new BadRequestException('Error enviando el email. Intente nuevamente');
    }

    return { message: 'Si el email existe, recibirás un código en breve' };
  }

  // ─────────────────────────────────────────────
  // VERIFICAR OTP Y CAMBIAR PASSWORD
  // ─────────────────────────────────────────────
  async verificarOtp(dto: { email: string; codigo: string; passwordNuevo: string }) {
    // Buscar OTP válido
    const otp = await this.prisma.otpVerificacion.findFirst({
      where: {
        email: dto.email,
        codigo: dto.codigo,
        usadoEn: null,
        expiraEn: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      throw new BadRequestException('Código inválido o expirado');
    }

    // Buscar usuario
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    // Actualizar password
    const passwordHash = await bcrypt.hash(dto.passwordNuevo, 10);
    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        passwordHash,
        debeCambiarPassword: false,
      },
    });

    // Marcar OTP como usado
    await this.prisma.otpVerificacion.update({
      where: { id: otp.id },
      data: { usadoEn: new Date() },
    });

    // Revocar todas las sesiones activas
    await this.prisma.usuarioSesion.updateMany({
      where: { usuarioId: usuario.id, revocadaEn: null },
      data: { revocadaEn: new Date() },
    });

    await this.prisma.auditoriaEvento.create({
      data: {
        usuarioId: usuario.id,
        accion: 'usuario.recuperacion_password',
      },
    });

    return { message: 'Password actualizado correctamente. Inicie sesión nuevamente' };
  }

  // ─────────────────────────────────────────────
  // REENVIAR OTP POR WHATSAPP
  // ─────────────────────────────────────────────
  async reenviarOtpWhatsapp(email: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { email } });

    // Responder igual para no revelar si el email/teléfono existe
    if (!usuario || usuario.estado !== 'activo') {
      return { message: 'Si el número está registrado, recibirás el código por WhatsApp' };
    }

    if (!usuario.telefono) {
      throw new BadRequestException(
        'No tienes un número de teléfono registrado. Contacta al administrador.',
      );
    }

    // Buscar OTP vigente del email (no generar uno nuevo)
    const otp = await this.prisma.otpVerificacion.findFirst({
      where: {
        email,
        usadoEn: null,
        expiraEn: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      throw new BadRequestException(
        'No hay un código vigente. Solicita uno nuevo primero.',
      );
    }

    // Enviar por WhatsApp
    const enviado = await this.whatsapp.enviarOtp(usuario.telefono, otp.codigo);

    if (!enviado) {
      throw new BadRequestException(
        'No se pudo enviar el código por WhatsApp. Intenta más tarde.',
      );
    }

    return { message: 'Código enviado por WhatsApp correctamente' };
  }
}
