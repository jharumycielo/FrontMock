import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { CambiarEstadoSolicitudDto } from './dto/cambiar-estado-solicitud.dto';

@Injectable()
export class RequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────
  private async getPerfil(perfilId: string) {
    const perfil = await this.prisma.usuarioEntidadRol.findUnique({
      where: { id: perfilId },
      include: { rol: true, entidadPublica: true, unidadOrganica: true },
    });
    if (!perfil) throw new ForbiddenException('Perfil no encontrado');
    return perfil;
  }

  // Genera número de solicitud: COD-AÑO-CORRELATIVO
  private async generarNumeroSolicitud(entidadId: string): Promise<string> {
    const anio = new Date().getFullYear();

    // Usar codigoNumerico de la entidad creadora
    const entidad = await this.prisma.entidadPublica.findUnique({
      where: { id: entidadId },
      select: { codigoNumerico: true },
    });

    const prefijo = `${entidad!.codigoNumerico}-${anio}`;

    const ultima = await this.prisma.solicitud.findFirst({
      where: { numeroSolicitud: { startsWith: prefijo } },
      orderBy: { numeroSolicitud: 'desc' },
    });

    let correlativo = 1;
    if (ultima?.numeroSolicitud) {
      const partes = ultima.numeroSolicitud.split('-');
      correlativo = parseInt(partes[partes.length - 1]) + 1;
    }

    return `${prefijo}-${String(correlativo).padStart(5, '0')}`;
  }

  // ─────────────────────────────────────────────
  // CREAR SOLICITUD (estado NUEVO)
  // ─────────────────────────────────────────────
  async crear(dto: CreateSolicitudDto, perfilId: string) {
    const perfil = await this.getPerfil(perfilId);

    if (perfil.rol.codigo !== 'CREADOR') {
      throw new ForbiddenException('Solo el rol CREADOR puede crear solicitudes');
    }

    // Verificar tipo de documento existe y está activo
    const tipoDoc = await this.prisma.tipoDocumento.findUnique({
      where: { id: dto.tipoDocumentoId },
    });
    if (!tipoDoc || !tipoDoc.esActivo) {
      throw new BadRequestException('Tipo de documento no válido o inactivo');
    }

    // Verificar que la acción está permitida en este tipo de documento
    const accionPermitida = await this.prisma.tipoDocumentoAccion.findFirst({
      where: { tipoDocumentoId: dto.tipoDocumentoId, tipoAccion: dto.tipoAccion },
    });
    if (!accionPermitida) {
      throw new BadRequestException(`La acción "${dto.tipoAccion}" no está permitida para este tipo de documento`);
    }

    // Validar esParaEntidadEstado → debe tener entidades
    for (const cuenta of dto.cuentas) {
      if (cuenta.esParaEntidadEstado && (!cuenta.entidades || cuenta.entidades.length === 0)) {
        throw new BadRequestException(
          `La cuenta ${cuenta.codigoCompleto} requiere al menos una entidad cuando esParaEntidadEstado = true`,
        );
      }
      // Limpiar campos condicionales
      if (!cuenta.tieneDinamicaContable) {
        cuenta.dinamicaDebita = undefined;
        cuenta.dinamicaAcredita = undefined;
        cuenta.dinamicaObjeto = undefined;
        cuenta.dinamicaSaldos = undefined;
      }
    }

    // Crear solicitud en estado NUEVO (sin número todavía)
    const solicitud = await this.prisma.solicitud.create({
      data: {
        tipoDocumentoId: dto.tipoDocumentoId,
        tipoAccion: dto.tipoAccion,
        fechaRequerimiento: new Date(dto.fechaRequerimiento),
        organoLinea: dto.organoLinea,
        justificacion: dto.justificacion,
        entidadCreadoraId: perfil.entidadPublicaId,
        unidadCreadoraId: perfil.unidadOrganicaId ?? null,
        perfilCreadorId: perfilId,
        // Destino fijo desde el tipo de documento
        entidadDestinoId: tipoDoc.entidadDestinoId,
        unidadDestinoId: tipoDoc.unidadDestinoId,
        rolDestinoId: tipoDoc.rolDestinoId,
        estado: 'NUEVO',
        provieneEntidadExterna: dto.provieneEntidadExterna ?? false,
        entidadExternaId: dto.entidadExternaId ?? null,
        createdBy: perfil.usuarioId,
        cuentas: {
          create: dto.cuentas.map(c => ({
            planContableId: c.planContableId,
            cuentaContableOrigenId: c.cuentaContableOrigenId ?? null,
            codigoCompleto: c.codigoCompleto,
            elemento: c.elemento,
            grupo: c.grupo ?? null,
            cuenta: c.cuenta ?? null,
            subcuenta1: c.subcuenta1 ?? null,
            subcuenta2: c.subcuenta2 ?? null,
            subcuenta3: c.subcuenta3 ?? null,
            nivel: c.nivel,
            nombre: c.nombre,
            codigoAnterior: c.codigoAnterior ?? null,
            esImputable: c.esImputable,
            naturaleza: c.naturaleza,
            tipoElemento: c.tipoElemento,
            esMonetaria: c.esMonetaria,
            aplicaExtraPresupuestaria: c.aplicaExtraPresupuestaria ?? false,
            esReciproca: c.esReciproca ?? false,
            tieneDinamicaContable: c.tieneDinamicaContable ?? false,
            dinamicaDebita: c.dinamicaDebita ?? null,
            dinamicaAcredita: c.dinamicaAcredita ?? null,
            dinamicaObjeto: c.dinamicaObjeto ?? null,
            dinamicaSaldos: c.dinamicaSaldos ?? null,
            esParaEntidadEstado: c.esParaEntidadEstado ?? false,
            seccionesModificadas: c.seccionesModificadas ?? [],
            ambitos: c.ambitos?.length
              ? { create: c.ambitos.map(a => ({ ambitoInstitucionalId: a.ambitoInstitucionalId })) }
              : undefined,
            entidades: c.entidades?.length
              ? { create: c.entidades.map(e => ({ entidadPublicaId: e.entidadPublicaId })) }
              : undefined,
          })),
        },
      },
      include: {
        tipoDocumento: { select: { nombre: true } },
        cuentas: true,
      },
    });

    // Registrar historial
    await this.prisma.solicitudEstadoHistorial.create({
      data: {
        solicitudId: solicitud.id,
        estadoAnterior: null,
        estadoNuevo: 'NUEVO',
        createdBy: perfil.usuarioId,
        perfilId,
      },
    });

    await this.prisma.auditoriaEvento.create({
      data: {
        usuarioId: perfil.usuarioId,
        perfilId,
        entidadPublicaId: perfil.entidadPublicaId,
        accion: 'solicitud.creada',
        tablaAfectada: 'solicitud',
        registroId: solicitud.id,
      },
    });

    return solicitud;
  }

  // ─────────────────────────────────────────────
  // CAMBIAR ESTADO
  // ─────────────────────────────────────────────
  async cambiarEstado(id: string, dto: CambiarEstadoSolicitudDto, perfilId: string) {
    const perfil = await this.getPerfil(perfilId);
    const rolCodigo = perfil.rol.codigo;

    const solicitud = await this.prisma.solicitud.findUnique({
      where: { id },
      include: {
        cuentas: true,
        sustentos: true,
      },
    });
    if (!solicitud) throw new NotFoundException('Solicitud no encontrada');

    const estadoActual = solicitud.estado;
    const estadoNuevo = dto.estadoNuevo;

    // ── Validar transiciones permitidas ──────────
    const transiciones: Record<string, string[]> = {
      CREADOR:   { NUEVO: ['ELABORADO'], ELABORADO: ['VERIFICADO', 'ELIMINADO'], OBSERVADO: ['ELABORADO', 'ELIMINADO'] }[estadoActual] ?? [],
      APROBADOR: { VERIFICADO: ['APROBADO', 'RECHAZADO', 'OBSERVADO'] }[estadoActual] ?? [],
      ADMIN_SISTEMA: ['ELIMINADO'],
      ADMIN_ENTIDAD: ['ELIMINADO'],
    };

    const permitidos = transiciones[rolCodigo] ?? [];
    if (!permitidos.includes(estadoNuevo)) {
      throw new BadRequestException(
        `El rol ${rolCodigo} no puede cambiar de ${estadoActual} a ${estadoNuevo}`,
      );
    }

    // ── Comentario obligatorio en OBSERVADO y RECHAZADO ──
    if (['OBSERVADO', 'RECHAZADO'].includes(estadoNuevo) && !dto.comentario?.trim()) {
      throw new BadRequestException('El comentario es obligatorio al observar o rechazar');
    }

    // ── Al ELABORAR: requiere mínimo 1 archivo ──
    if (estadoNuevo === 'ELABORADO' && solicitud.sustentos.length === 0) {
      throw new BadRequestException('Debe adjuntar al menos un archivo de sustento antes de elaborar');
    }

    // ── Generar número al pasar a ELABORADO ──
    let numeroSolicitud = solicitud.numeroSolicitud;
    if (estadoNuevo === 'ELABORADO' && !numeroSolicitud) {
      numeroSolicitud = await this.generarNumeroSolicitud(solicitud.entidadCreadoraId);
    }

    // ── Actualizar estado ──
    await this.prisma.solicitud.update({
      where: { id },
      data: {
        estado: estadoNuevo as any,
        numeroSolicitud,
        updatedBy: perfil.usuarioId,
      },
    });

    // ── Registrar historial ──
    await this.prisma.solicitudEstadoHistorial.create({
      data: {
        solicitudId: id,
        estadoAnterior: estadoActual as any,
        estadoNuevo: estadoNuevo as any,
        comentario: dto.comentario?.trim() || null,
        createdBy: perfil.usuarioId,
        perfilId,
      },
    });

    // ── Al APROBAR: crear cuentas oficiales ──
    if (estadoNuevo === 'APROBADO') {
      await this.aprobarCuentas(solicitud.cuentas, perfil.usuarioId);
    }

    // ── Notificaciones por email ──
    if (estadoNuevo === 'VERIFICADO') {
      this.notifications.notificarSolicitudVerificada(id).catch(() => {});
    } else if (estadoNuevo === 'OBSERVADO') {
      this.notifications.notificarSolicitudObservada(id, dto.comentario!).catch(() => {});
    } else if (estadoNuevo === 'RECHAZADO') {
      this.notifications.notificarSolicitudRechazada(id, dto.comentario!).catch(() => {});
    } else if (estadoNuevo === 'APROBADO') {
      this.notifications.notificarSolicitudAprobada(id).catch(() => {});
    }

    await this.prisma.auditoriaEvento.create({
      data: {
        usuarioId: perfil.usuarioId,
        perfilId,
        entidadPublicaId: perfil.entidadPublicaId,
        accion: `solicitud.${estadoNuevo.toLowerCase()}`,
        tablaAfectada: 'solicitud',
        registroId: id,
        valorAnterior: { estado: estadoActual },
        valorNuevo: { estado: estadoNuevo, comentario: dto.comentario },
      },
    });

    return { message: `Solicitud ${estadoNuevo.toLowerCase()} correctamente`, numeroSolicitud };
  }

  // ─────────────────────────────────────────────
  // APROBAR CUENTAS — crear/actualizar en el plan oficial
  // ─────────────────────────────────────────────
  private async aprobarCuentas(cuentas: any[], usuarioId: string) {
    for (const cuentaSolicitud of cuentas) {
      // Verificar que el plan es editable
      const plan = await this.prisma.planContable.findUnique({
        where: { id: cuentaSolicitud.planContableId },
      });
      if (!plan?.esEditable) continue;

      if (cuentaSolicitud.cuentaContableOrigenId) {
        // Modificación — actualizar cuenta existente
        const data: any = {};
        if (cuentaSolicitud.seccionesModificadas.includes('atributos')) {
          data.nombre = cuentaSolicitud.nombre;
          data.naturaleza = cuentaSolicitud.naturaleza;
          data.tipoElemento = cuentaSolicitud.tipoElemento;
          data.esImputable = cuentaSolicitud.esImputable;
          data.esMonetaria = cuentaSolicitud.esMonetaria;
          data.tieneDinamicaContable = cuentaSolicitud.tieneDinamicaContable;
          data.dinamicaDebita = cuentaSolicitud.dinamicaDebita;
          data.dinamicaAcredita = cuentaSolicitud.dinamicaAcredita;
          data.dinamicaObjeto = cuentaSolicitud.dinamicaObjeto;
          data.dinamicaSaldos = cuentaSolicitud.dinamicaSaldos;
        }
        if (cuentaSolicitud.seccionesModificadas.includes('vigencia')) {
          data.esVigente = cuentaSolicitud.esVigente;
          data.esVisible = cuentaSolicitud.esVisible;
        }
        await this.prisma.cuentaContable.update({
          where: { id: cuentaSolicitud.cuentaContableOrigenId },
          data: { ...data, updatedBy: usuarioId },
        });
      } else {
        // Creación — nueva cuenta oficial
        const nuevaCuenta = await this.prisma.cuentaContable.create({
          data: {
            planContableId: cuentaSolicitud.planContableId,
            codigoCompleto: cuentaSolicitud.codigoCompleto,
            elemento: cuentaSolicitud.elemento,
            grupo: cuentaSolicitud.grupo,
            cuenta: cuentaSolicitud.cuenta,
            subcuenta1: cuentaSolicitud.subcuenta1,
            subcuenta2: cuentaSolicitud.subcuenta2,
            subcuenta3: cuentaSolicitud.subcuenta3,
            nivel: cuentaSolicitud.nivel,
            nombre: cuentaSolicitud.nombre,
            codigoAnterior: cuentaSolicitud.codigoAnterior,
            esImputable: cuentaSolicitud.esImputable,
            naturaleza: cuentaSolicitud.naturaleza,
            tipoElemento: cuentaSolicitud.tipoElemento,
            esMonetaria: cuentaSolicitud.esMonetaria,
            aplicaExtraPresupuestaria: cuentaSolicitud.aplicaExtraPresupuestaria,
            esReciproca: cuentaSolicitud.esReciproca,
            tieneDinamicaContable: cuentaSolicitud.tieneDinamicaContable,
            dinamicaDebita: cuentaSolicitud.dinamicaDebita,
            dinamicaAcredita: cuentaSolicitud.dinamicaAcredita,
            dinamicaObjeto: cuentaSolicitud.dinamicaObjeto,
            dinamicaSaldos: cuentaSolicitud.dinamicaSaldos,
            esParaEntidadEstado: cuentaSolicitud.esParaEntidadEstado,
            esVigente: true,
            esVisible: true,
            createdBy: usuarioId,
          },
        });

        // Copiar entidades si aplica
        if (cuentaSolicitud.esParaEntidadEstado) {
          const entidades = await this.prisma.solicitudCuentaEntidadEstado.findMany({
            where: { solicitudCuentaContableId: cuentaSolicitud.id },
          });
          for (const e of entidades) {
            await this.prisma.cuentaContableEntidadEstado.create({
              data: { cuentaContableId: nuevaCuenta.id, entidadPublicaId: e.entidadPublicaId },
            });
          }
        }

        // Copiar ámbitos
        const ambitos = await this.prisma.solicitudCuentaAmbito.findMany({
          where: { solicitudCuentaContableId: cuentaSolicitud.id },
        });
        for (const a of ambitos) {
          await this.prisma.cuentaContableAmbito.create({
            data: { cuentaContableId: nuevaCuenta.id, ambitoInstitucionalId: a.ambitoInstitucionalId },
          });
        }
      }
    }
  }

  // ─────────────────────────────────────────────
  // BANDEJA DEL CREADOR
  // ─────────────────────────────────────────────
  async bandejaCreador(perfilId: string) {
    const perfil = await this.getPerfil(perfilId);

    return this.prisma.solicitud.findMany({
      where: { perfilCreadorId: perfilId },
      include: {
        tipoDocumento: { select: { nombre: true } },
        entidadCreadora: { select: { nombre: true } },
        historialEstados: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: { select: { cuentas: true, sustentos: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─────────────────────────────────────────────
  // BANDEJA DEL APROBADOR
  // ─────────────────────────────────────────────
  async bandejaAprobador(perfilId: string) {
    const perfil = await this.getPerfil(perfilId);

    return this.prisma.solicitud.findMany({
      where: {
        entidadDestinoId: perfil.entidadPublicaId,
        unidadDestinoId: perfil.unidadOrganicaId ?? undefined,
        rolDestinoId: perfil.rolId,
        estado: { in: ['VERIFICADO', 'OBSERVADO'] },
      },
      include: {
        tipoDocumento: { select: { nombre: true } },
        entidadCreadora: { select: { nombre: true } },
        historialEstados: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: { select: { cuentas: true, sustentos: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  // ─────────────────────────────────────────────
  // OBTENER DETALLE
  // ─────────────────────────────────────────────
  async obtenerDetalle(id: string, perfilId: string) {
    const perfil = await this.getPerfil(perfilId);

    const solicitud = await this.prisma.solicitud.findUnique({
      where: { id },
      include: {
        tipoDocumento: { select: { nombre: true, modulo: true } },
        entidadCreadora: { select: { nombre: true } },
        unidadCreadora: { select: { nombre: true } },
        rolDestino: { select: { nombre: true } },
        cuentas: {
          include: {
            ambitos: { include: { ambitoInstitucional: true } },
            entidades: { include: { entidadPublica: { select: { nombre: true } } } },
          },
        },
        sustentos: {
          include: { archivo: true },
        },
        historialEstados: {
          include: {
            creador: { select: { nombres: true, apellidos: true } },
            perfil: { include: { rol: { select: { nombre: true } } } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!solicitud) throw new NotFoundException('Solicitud no encontrada');

    return solicitud;
  }
}
