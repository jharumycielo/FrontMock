import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CambiarPasswordDto } from './dto/cambiar-password.dto';
import { CambiarPerfilDto } from './dto/cambiar-perfil.dto';
import { SolicitarOtpDto } from './dto/solicitar-otp.dto';
import { VerificarOtpDto } from './dto/verificar-otp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /api/v1/auth/login
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto, @Req() req: Request) {
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    return this.authService.login(dto, ip, userAgent);
  }

  // POST /api/v1/auth/logout
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: any) {
    return this.authService.logout(req.user.sesionId, req.user.usuarioId);
  }

  // POST /api/v1/auth/refresh
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() body: { sesionId: string; refreshToken: string }) {
    return this.authService.refresh(body.sesionId, body.refreshToken);
  }

  // POST /api/v1/auth/cambiar-password
  @Post('cambiar-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  cambiarPassword(@Body() dto: CambiarPasswordDto, @Req() req: any) {
    return this.authService.cambiarPassword(
      req.user.usuarioId,
      req.user.sesionId,
      dto,
    );
  }

  // PATCH /api/v1/auth/cambiar-perfil
  @Patch('cambiar-perfil')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  cambiarPerfil(@Body() dto: CambiarPerfilDto, @Req() req: any) {
    return this.authService.cambiarPerfil(
      req.user.usuarioId,
      req.user.sesionId,
      dto,
    );
  }

  // POST /api/v1/auth/solicitar-otp
  @Post('solicitar-otp')
  @HttpCode(HttpStatus.OK)
  solicitarOtp(@Body() dto: SolicitarOtpDto) {
    return this.authService.solicitarOtp(dto.email);
  }

  // POST /api/v1/auth/verificar-otp
  @Post('verificar-otp')
  @HttpCode(HttpStatus.OK)
  verificarOtp(@Body() dto: VerificarOtpDto) {
    return this.authService.verificarOtp({
      email: dto.email,
      codigo: dto.codigo,
      passwordNuevo: dto.passwordNuevo,
    });
  }

  // POST /api/v1/auth/reenviar-otp-whatsapp
  @Post('reenviar-otp-whatsapp')
  @HttpCode(HttpStatus.OK)
  reenviarOtpWhatsapp(@Body() dto: SolicitarOtpDto) {
    return this.authService.reenviarOtpWhatsapp(dto.email);
  }
}
