import {
  Controller, Get, Post, Body,
  Param, Query, UseGuards, Req, HttpCode, HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChartAccountsService } from './chart-accounts.service';
import { CreatePlanDto } from './dto/create-plan.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class ChartAccountsController {
  constructor(private readonly chartAccountsService: ChartAccountsService) {}

  // ── PLANES ──────────────────────────────────

  // GET /api/v1/planes
  @Get('planes')
  listarPlanes() {
    return this.chartAccountsService.listarPlanes();
  }

  // GET /api/v1/planes/:id
  @Get('planes/:id')
  obtenerPlan(@Param('id') id: string) {
    return this.chartAccountsService.obtenerPlan(id);
  }

  // POST /api/v1/planes
  @Post('planes')
  @HttpCode(HttpStatus.CREATED)
  crearPlan(@Body() dto: CreatePlanDto, @Req() req: any) {
    return this.chartAccountsService.crearPlan(dto, req.user.perfilId);
  }

  // ── CUENTAS ──────────────────────────────────

  // GET /api/v1/planes/:id/cuentas
  @Get('planes/:id/cuentas')
  listarCuentas(@Param('id') planId: string, @Req() req: any) {
    return this.chartAccountsService.listarCuentas(planId, req.user.perfilId);
  }

  // GET /api/v1/cuentas/:id
  @Get('cuentas/:id')
  obtenerCuenta(@Param('id') id: string) {
    return this.chartAccountsService.obtenerCuenta(id);
  }

  // GET /api/v1/cuentas/validar?codigo=1.01&planId=uuid
  // Usado por el frontend mientras el usuario escribe el código
  @Get('cuentas/validar/codigo')
  validarCodigo(
    @Query('codigo') codigo: string,
    @Query('planId') planId: string,
  ) {
    return this.chartAccountsService.validarCodigo(codigo, planId);
  }

  // ── CATÁLOGOS ──────────────────────────────────

  // GET /api/v1/ambitos
  @Get('ambitos')
  listarAmbitos() {
    return this.chartAccountsService.listarAmbitos();
  }

  // GET /api/v1/tipos-documento
  @Get('tipos-documento')
  listarTiposDocumento() {
    return this.chartAccountsService.listarTiposDocumento();
  }

  // GET /api/v1/roles
  @Get('roles')
  listarRoles() {
    return this.chartAccountsService.listarRoles();
  }
}
