import {
  Controller, Get, Post, Patch, Body,
  Param, UseGuards, Req, HttpCode, HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationService } from './organization.service';
import { CreateEntidadDto } from './dto/create-entidad.dto';
import { UpdateEntidadDto } from './dto/update-entidad.dto';
import { CambiarEstadoEntidadDto } from './dto/cambiar-estado-entidad.dto';
import { CreateUnidadDto } from './dto/create-unidad.dto';
import { CambiarEstadoUnidadDto } from './dto/cambiar-estado-unidad.dto';

@Controller('entidades')
@UseGuards(JwtAuthGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  // ── ENTIDADES ──────────────────────────────────

  // GET /api/v1/entidades
  @Get()
  listarEntidades(@Req() req: any) {
    return this.organizationService.listarEntidades(req.user.perfilId);
  }

  // GET /api/v1/entidades/:id
  @Get(':id')
  obtenerEntidad(@Param('id') id: string) {
    return this.organizationService.obtenerEntidad(id);
  }

  // POST /api/v1/entidades
  @Post()
  @HttpCode(HttpStatus.CREATED)
  crearEntidad(@Body() dto: CreateEntidadDto, @Req() req: any) {
    return this.organizationService.crearEntidad(dto, req.user.perfilId);
  }

  // PATCH /api/v1/entidades/:id
  @Patch(':id')
  editarEntidad(
    @Param('id') id: string,
    @Body() dto: UpdateEntidadDto,
    @Req() req: any,
  ) {
    return this.organizationService.editarEntidad(id, dto, req.user.perfilId);
  }

  // PATCH /api/v1/entidades/:id/estado
  @Patch(':id/estado')
  cambiarEstadoEntidad(
    @Param('id') id: string,
    @Body() dto: CambiarEstadoEntidadDto,
    @Req() req: any,
  ) {
    return this.organizationService.cambiarEstadoEntidad(id, dto, req.user.perfilId);
  }

  // ── UNIDADES ──────────────────────────────────

  // GET /api/v1/entidades/:id/unidades
  @Get(':id/unidades')
  listarUnidades(@Param('id') id: string) {
    return this.organizationService.listarUnidades(id);
  }

  // POST /api/v1/entidades/:id/unidades
  @Post(':id/unidades')
  @HttpCode(HttpStatus.CREATED)
  crearUnidad(
    @Param('id') entidadId: string,
    @Body() dto: CreateUnidadDto,
    @Req() req: any,
  ) {
    return this.organizationService.crearUnidad(entidadId, dto, req.user.perfilId);
  }

  // PATCH /api/v1/entidades/:id/unidades/:uid
  @Patch(':id/unidades/:uid')
  editarUnidad(
    @Param('id') entidadId: string,
    @Param('uid') unidadId: string,
    @Body() dto: CreateUnidadDto,
    @Req() req: any,
  ) {
    return this.organizationService.editarUnidad(entidadId, unidadId, dto, req.user.perfilId);
  }

  // PATCH /api/v1/entidades/:id/unidades/:uid/estado
  @Patch(':id/unidades/:uid/estado')
  cambiarEstadoUnidad(
    @Param('id') entidadId: string,
    @Param('uid') unidadId: string,
    @Body() dto: CambiarEstadoUnidadDto,
    @Req() req: any,
  ) {
    return this.organizationService.cambiarEstadoUnidad(entidadId, unidadId, dto, req.user.perfilId);
  }
}
