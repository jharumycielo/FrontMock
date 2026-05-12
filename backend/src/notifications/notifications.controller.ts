import { Controller, Get, Patch, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notificaciones')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // GET /api/v1/notificaciones
  @Get()
  obtenerNoLeidas(@Req() req: any) {
    return this.notificationsService.obtenerNoLeidas(req.user.usuarioId);
  }

  // GET /api/v1/notificaciones/contador
  @Get('contador')
  contarNoLeidas(@Req() req: any) {
    return this.notificationsService.contarNoLeidas(req.user.usuarioId);
  }

  // PATCH /api/v1/notificaciones/marcar-leidas
  @Patch('marcar-leidas')
  marcarLeidas(@Req() req: any) {
    return this.notificationsService.marcarLeidas(req.user.usuarioId);
  }
}
