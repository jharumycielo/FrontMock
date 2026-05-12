import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';

@Injectable()
export class ChartAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────
  private async getPerfil(perfilId: string) {
    const perfil = await this.prisma.usuarioEntidadRol.findUnique({
      where: { id: perfilId },
      include: { rol: true },
    });
    if (!perfil) throw new ForbiddenException('Perfil no encontrado');
    return perfil;
  }

  // ─────────────────────────────────────────────
  // PLANES CONTABLES
  // ─────────────────────────────────────────────

  async listarPlanes() {
    return this.prisma.planContable.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        numeroPlanContable: true,
        descripcion: true,
        tipoPlan: true,
        esEditable: true,
        esVigente: true,
        fechaInicio: true,
        fechaFin: true,
        _count: { select: { cuentas: true } },
      },
    });
  }

  async obtenerPlan(id: string) {
    const plan = await this.prisma.planContable.findUnique({
      where: { id },
      include: {
        _count: { select: { cuentas: true } },
      },
    });
    if (!plan) throw new NotFoundException('Plan contable no encontrado');
    return plan;
  }

  async crearPlan(dto: CreatePlanDto, perfilId: string) {
    const perfil = await this.getPerfil(perfilId);

    // Solo CREADOR de DGCP puede crear planes
    if (!['CREADOR', 'ADMIN_SISTEMA'].includes(perfil.rol.codigo)) {
      throw new ForbiddenException('No tiene permisos para crear planes contables');
    }

    const existe = await this.prisma.planContable.findUnique({
      where: { numeroPlanContable: dto.numeroPlanContable },
    });
    if (existe) throw new BadRequestException('Ya existe un plan con ese número');

    const esEditable = dto.tipoPlan === 'gubernamental_unico';

    return this.prisma.planContable.create({
      data: {
        numeroPlanContable: dto.numeroPlanContable,
        descripcion: dto.descripcion,
        fecha: new Date(dto.fecha),
        vigenciaPlanContable: dto.vigenciaPlanContable,
        fechaInicio: new Date(dto.fechaInicio),
        fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : null,
        tipoPlan: dto.tipoPlan as any,
        esEditable,
        esVigente: true,
        esVisible: true,
      },
    });
  }

  // ─────────────────────────────────────────────
  // CUENTAS CONTABLES
  // ─────────────────────────────────────────────

  async listarCuentas(planId: string, perfilId: string) {
    const perfil = await this.getPerfil(perfilId);

    const plan = await this.prisma.planContable.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan contable no encontrado');

    const esDGCPOAdmin = ['CREADOR', 'APROBADOR', 'ADMIN_SISTEMA', 'ADMIN_ENTIDAD'].includes(
      perfil.rol.codigo,
    );

    // DGCP ve todas — otras entidades ven generales + las suyas
    const where: any = {
      planContableId: planId,
      esVisible: true,
    };

    if (!esDGCPOAdmin) {
      where.OR = [
        { esParaEntidadEstado: false },
        {
          esParaEntidadEstado: true,
          entidades: { some: { entidadPublicaId: perfil.entidadPublicaId } },
        },
      ];
    }

    return this.prisma.cuentaContable.findMany({
      where,
      include: {
        ambitos: { include: { ambitoInstitucional: { select: { codigo: true, descripcion: true } } } },
        entidades: { include: { entidadPublica: { select: { nombre: true } } } },
      },
      orderBy: { codigoCompleto: 'asc' },
    });
  }

  async obtenerCuenta(id: string) {
    const cuenta = await this.prisma.cuentaContable.findUnique({
      where: { id },
      include: {
        plan: { select: { numeroPlanContable: true, descripcion: true } },
        ambitos: { include: { ambitoInstitucional: true } },
        entidades: { include: { entidadPublica: { select: { nombre: true } } } },
        hijos: { select: { id: true, codigoCompleto: true, nombre: true, nivel: true } },
        parent: { select: { id: true, codigoCompleto: true, nombre: true } },
      },
    });
    if (!cuenta) throw new NotFoundException('Cuenta contable no encontrada');
    return cuenta;
  }

  // Validar código parcial — usado por el frontend mientras el usuario escribe
  async validarCodigo(codigo: string, planId: string) {
    const cuenta = await this.prisma.cuentaContable.findFirst({
      where: { planContableId: planId, codigoCompleto: codigo },
      select: {
        id: true,
        codigoCompleto: true,
        nombre: true,
        nivel: true,
        esImputable: true,
        esVigente: true,
      },
    });

    return {
      existe: !!cuenta,
      cuenta: cuenta ?? null,
    };
  }

  // ─────────────────────────────────────────────
  // ÁMBITOS INSTITUCIONALES
  // ─────────────────────────────────────────────
  async listarAmbitos() {
    return this.prisma.ambitoInstitucional.findMany({
      where: { esActivo: true },
      orderBy: { codigo: 'asc' },
    });
  }

  // ─────────────────────────────────────────────
  // TIPOS DE DOCUMENTO (catálogo)
  // ─────────────────────────────────────────────
  async listarTiposDocumento() {
    return this.prisma.tipoDocumento.findMany({
      where: { esActivo: true },
      include: {
        accionesPermitidas: true,
        entidadDestino: { select: { nombre: true } },
        unidadDestino: { select: { nombre: true } },
        rolDestino: { select: { nombre: true, codigo: true } },
      },
    });
  }

  // ─────────────────────────────────────────────
  // ROLES (catálogo para selects)
  // ─────────────────────────────────────────────
  async listarRoles() {
    return this.prisma.rol.findMany({
      where: { esActivo: true },
      select: { id: true, codigo: true, nombre: true },
      orderBy: { nombre: 'asc' },
    });
  }
}
