import {
  Controller, Get, Post, Patch,
  Body, Param, UseGuards, Req,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestsService } from './requests.service';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { CambiarEstadoSolicitudDto } from './dto/cambiar-estado-solicitud.dto';

@Controller('solicitudes')
@UseGuards(JwtAuthGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  // POST /api/v1/solicitudes
  @Post()
  @HttpCode(HttpStatus.CREATED)
  crear(@Body() dto: CreateSolicitudDto, @Req() req: any) {
    return this.requestsService.crear(dto, req.user.perfilId);
  }

  // GET /api/v1/solicitudes/bandeja-creador
  @Get('bandeja-creador')
  bandejaCreador(@Req() req: any) {
    return this.requestsService.bandejaCreador(req.user.perfilId);
  }

  // GET /api/v1/solicitudes/bandeja-aprobador
  @Get('bandeja-aprobador')
  bandejaAprobador(@Req() req: any) {
    return this.requestsService.bandejaAprobador(req.user.perfilId);
  }

  // GET /api/v1/solicitudes/:id
  @Get(':id')
  obtenerDetalle(@Param('id') id: string, @Req() req: any) {
    return this.requestsService.obtenerDetalle(id, req.user.perfilId);
  }

  // PATCH /api/v1/solicitudes/:id/estado
  @Patch(':id/estado')
  cambiarEstado(
    @Param('id') id: string,
    @Body() dto: CambiarEstadoSolicitudDto,
    @Req() req: any,
  ) {
    return this.requestsService.cambiarEstado(id, dto, req.user.perfilId);
  }
}
