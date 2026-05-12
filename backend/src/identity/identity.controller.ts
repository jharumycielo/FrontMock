import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IdentityService } from './identity.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto';
import { AgregarPerfilDto } from './dto/agregar-perfil.dto';
import { InvitacionDto } from './dto/invitacion.dto';

@Controller('usuarios')
@UseGuards(JwtAuthGuard)
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  // POST /api/v1/usuarios
  @Post()
  @HttpCode(HttpStatus.CREATED)
  crear(@Body() dto: CreateUsuarioDto, @Req() req: any) {
    return this.identityService.crear(dto, req.user.perfilId);
  }

  // POST /api/v1/usuarios/invitacion
  @Post('invitacion')
  @HttpCode(HttpStatus.CREATED)
  crearInvitacion(@Body() dto: InvitacionDto, @Req() req: any) {
    return this.identityService.crearInvitacion(dto, req.user.perfilId);
  }

  // GET /api/v1/usuarios
  @Get()
  listar(@Req() req: any) {
    return this.identityService.listar(req.user.perfilId);
  }

  // GET /api/v1/usuarios/:id
  @Get(':id')
  obtenerPorId(@Param('id') id: string, @Req() req: any) {
    return this.identityService.obtenerPorId(id, req.user.perfilId);
  }

  // PATCH /api/v1/usuarios/:id
  @Patch(':id')
  editar(
    @Param('id') id: string,
    @Body() dto: UpdateUsuarioDto,
    @Req() req: any,
  ) {
    return this.identityService.editar(id, dto, req.user.perfilId);
  }

  // PATCH /api/v1/usuarios/:id/estado
  @Patch(':id/estado')
  cambiarEstado(
    @Param('id') id: string,
    @Body() dto: CambiarEstadoDto,
    @Req() req: any,
  ) {
    return this.identityService.cambiarEstado(id, dto, req.user.perfilId);
  }

  // POST /api/v1/usuarios/:id/perfiles
  @Post(':id/perfiles')
  @HttpCode(HttpStatus.CREATED)
  agregarPerfil(
    @Param('id') id: string,
    @Body() dto: AgregarPerfilDto,
    @Req() req: any,
  ) {
    return this.identityService.agregarPerfil(id, dto, req.user.perfilId);
  }

  // DELETE /api/v1/usuarios/:id/perfiles/:perfilId
  @Delete(':id/perfiles/:perfilId')
  quitarPerfil(
    @Param('id') id: string,
    @Param('perfilId') perfilId: string,
    @Req() req: any,
  ) {
    return this.identityService.quitarPerfil(id, perfilId, req.user.perfilId);
  }
}
