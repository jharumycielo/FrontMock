import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEntidadDto } from './dto/create-entidad.dto';
import { UpdateEntidadDto } from './dto/update-entidad.dto';
import { CambiarEstadoEntidadDto } from './dto/cambiar-estado-entidad.dto';
import { CreateUnidadDto } from './dto/create-unidad.dto';
import { CambiarEstadoUnidadDto } from './dto/cambiar-estado-unidad.dto';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────
  private async verificarAdminSistema(perfilId: string) {
    const perfil = await this.prisma.usuarioEntidadRol.findUnique({
      where: { id: perfilId },
      include: { rol: true },
    });
    if (!perfil || perfil.rol.codigo !== 'ADMIN_SISTEMA') {
      throw new ForbiddenException('Solo ADMIN_SISTEMA puede realizar esta acción');
    }
    return perfil;
  }

  private async verificarAdminEntidadOSistema(perfilId: string, entidadId?: string) {
    const perfil = await this.prisma.usuarioEntidadRol.findUnique({
      where: { id: perfilId },
      include: { rol: true },
    });
    if (!perfil) throw new ForbiddenException('Perfil no encontrado');

    const esAdminSistema = perfil.rol.codigo === 'ADMIN_SISTEMA';
    const esAdminEntidad = perfil.rol.codigo === 'ADMIN_ENTIDAD';

    if (!esAdminSistema && !esAdminEntidad) {
      throw new ForbiddenException('No tiene permisos para esta acción');
    }

    if (esAdminEntidad && entidadId && perfil.entidadPublicaId !== entidadId) {
      throw new ForbiddenException('Solo puede gestionar unidades de su entidad');
    }

    return { perfil, esAdminSistema };
  }

  private async registrarAuditoria(
    perfilId: string,
    accion: string,
    tablaAfectada: string,
    registroId: string,
    valorAnterior?: any,
    valorNuevo?: any,
  ) {
    const perfil = await this.prisma.usuarioEntidadRol.findUnique({
      where: { id: perfilId },
    });
    await this.prisma.auditoriaEvento.create({
      data: {
        usuarioId: perfil!.usuarioId,
        perfilId,
        entidadPublicaId: perfil!.entidadPublicaId,
        accion,
        tablaAfectada,
        registroId,
        valorAnterior: valorAnterior ?? undefined,
        valorNuevo: valorNuevo ?? undefined,
      },
    });
  }

  // ─────────────────────────────────────────────
  // ENTIDADES — LISTAR
  // ─────────────────────────────────────────────
  async listarEntidades(perfilId: string) {
    const perfil = await this.prisma.usuarioEntidadRol.findUnique({
      where: { id: perfilId },
      include: { rol: true },
    });

    const esAdminSistema = perfil?.rol.codigo === 'ADMIN_SISTEMA';

    return this.prisma.entidadPublica.findMany({
      where: esAdminSistema
        ? {}
        : { id: perfil!.entidadPublicaId },
      include: {
        entidadPadre: { select: { nombre: true } },
        unidades: {
          where: { estadoUnidad: 'activa' },
          select: { id: true, codigo: true, nombre: true, tipoUnidad: true },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  // ─────────────────────────────────────────────
  // ENTIDADES — OBTENER POR ID
  // ─────────────────────────────────────────────
  async obtenerEntidad(id: string) {
    const entidad = await this.prisma.entidadPublica.findUnique({
      where: { id },
      include: {
        entidadPadre: { select: { id: true, nombre: true } },
        subEntidades: { select: { id: true, nombre: true, estadoEntidad: true } },
        unidades: {
          select: {
            id: true, codigo: true, nombre: true,
            tipoUnidad: true, estadoUnidad: true,
          },
        },
      },
    });

    if (!entidad) throw new NotFoundException('Entidad no encontrada');
    return entidad;
  }

  // ─────────────────────────────────────────────
  // ENTIDADES — CREAR
  // ─────────────────────────────────────────────
  async crearEntidad(dto: CreateEntidadDto, perfilId: string) {
    await this.verificarAdminSistema(perfilId);

    const existeCodigo = await this.prisma.entidadPublica.findUnique({
      where: { codigo: dto.codigo },
    });
    if (existeCodigo) throw new BadRequestException('El código ya está en uso');

    // Auto-asignar código numérico
    const ultima = await this.prisma.entidadPublica.findFirst({
      orderBy: { codigoNumerico: 'desc' },
      select: { codigoNumerico: true },
    });
    const codigoNumerico = (ultima?.codigoNumerico ?? 0) + 1;

    const entidad = await this.prisma.entidadPublica.create({
      data: {
        codigoNumerico,
        codigo: dto.codigo,
        ruc: dto.ruc ?? null,
        nombre: dto.nombre,
        tipoEntidad: dto.tipoEntidad as any,
        entidadPadreId: dto.entidadPadreId ?? null,
        estadoEntidad: 'activa',
      },
    });

    await this.registrarAuditoria(perfilId, 'entidad.creada', 'entidad_publica', entidad.id, null, dto);
    return entidad;
  }

  // ─────────────────────────────────────────────
  // ENTIDADES — EDITAR
  // ─────────────────────────────────────────────
  async editarEntidad(id: string, dto: UpdateEntidadDto, perfilId: string) {
    await this.verificarAdminSistema(perfilId);

    const entidad = await this.prisma.entidadPublica.findUnique({ where: { id } });
    if (!entidad) throw new NotFoundException('Entidad no encontrada');

    if (['archivada', 'migrada'].includes(entidad.estadoEntidad)) {
      throw new BadRequestException('No se puede editar una entidad archivada o migrada');
    }

    const actualizada = await this.prisma.entidadPublica.update({
      where: { id },
      data: dto,
    });

    await this.registrarAuditoria(perfilId, 'entidad.editada', 'entidad_publica', id, entidad, dto);
    return actualizada;
  }

  // ─────────────────────────────────────────────
  // ENTIDADES — CAMBIAR ESTADO
  // ─────────────────────────────────────────────
  async cambiarEstadoEntidad(id: string, dto: CambiarEstadoEntidadDto, perfilId: string) {
    await this.verificarAdminSistema(perfilId);

    const entidad = await this.prisma.entidadPublica.findUnique({
      where: { id },
      include: {
        perfiles: { where: { esActivo: true }, include: { usuario: true } },
      },
    });
    if (!entidad) throw new NotFoundException('Entidad no encontrada');

    // No se puede reactivar una entidad archivada o migrada
    if (['archivada', 'migrada'].includes(entidad.estadoEntidad) && dto.estado === 'activa') {
      throw new BadRequestException(`No se puede reactivar una entidad ${entidad.estadoEntidad}`);
    }

    // Migración requiere entidad destino
    if (dto.estado === 'migrada' && !dto.entidadMigracionId) {
      throw new BadRequestException('Debe indicar la entidad destino para la migración');
    }

    const ahora = new Date();
    const data: any = {
      estadoEntidad: dto.estado,
      ...(dto.estado === 'suspendida' && { fechaSuspension: ahora }),
      ...(dto.estado === 'migrada' && {
        fechaMigracion: ahora,
        entidadMigracionId: dto.entidadMigracionId,
      }),
      ...(dto.estado === 'archivada' && { fechaArchivado: ahora }),
      ...(dto.estado === 'activa' && {
        fechaSuspension: null,
      }),
    };

    await this.prisma.entidadPublica.update({ where: { id }, data });

    // Al suspender → inactivar usuarios de la entidad
    if (dto.estado === 'suspendida') {
      const usuarioIds = entidad.perfiles.map(p => p.usuarioId);
      await this.prisma.usuario.updateMany({
        where: { id: { in: usuarioIds } },
        data: { estado: 'inactivo' },
      });
    }

    // Al reactivar → reactivar usuarios
    if (dto.estado === 'activa') {
      const usuarioIds = entidad.perfiles.map(p => p.usuarioId);
      await this.prisma.usuario.updateMany({
        where: { id: { in: usuarioIds } },
        data: { estado: 'activo' },
      });
    }

    await this.registrarAuditoria(
      perfilId,
      `entidad.${dto.estado}`,
      'entidad_publica',
      id,
      { estadoEntidad: entidad.estadoEntidad },
      { estadoEntidad: dto.estado, motivo: dto.motivo },
    );

    return { message: `Entidad ${dto.estado} correctamente` };
  }

  // ─────────────────────────────────────────────
  // UNIDADES — LISTAR
  // ─────────────────────────────────────────────
  async listarUnidades(entidadId: string) {
    const entidad = await this.prisma.entidadPublica.findUnique({ where: { id: entidadId } });
    if (!entidad) throw new NotFoundException('Entidad no encontrada');

    return this.prisma.unidadOrganica.findMany({
      where: { entidadPublicaId: entidadId },
      orderBy: { nombre: 'asc' },
    });
  }

  // ─────────────────────────────────────────────
  // UNIDADES — CREAR
  // ─────────────────────────────────────────────
  async crearUnidad(entidadId: string, dto: CreateUnidadDto, perfilId: string) {
    await this.verificarAdminEntidadOSistema(perfilId, entidadId);

    const entidad = await this.prisma.entidadPublica.findUnique({ where: { id: entidadId } });
    if (!entidad) throw new NotFoundException('Entidad no encontrada');

    if (['archivada', 'migrada'].includes(entidad.estadoEntidad)) {
      throw new BadRequestException('No se pueden crear unidades en una entidad archivada o migrada');
    }

    const existeCodigo = await this.prisma.unidadOrganica.findUnique({
      where: { entidadPublicaId_codigo: { entidadPublicaId: entidadId, codigo: dto.codigo } },
    });
    if (existeCodigo) throw new BadRequestException('El código ya existe en esta entidad');

    const unidad = await this.prisma.unidadOrganica.create({
      data: {
        entidadPublicaId: entidadId,
        codigo: dto.codigo,
        nombre: dto.nombre,
        tipoUnidad: dto.tipoUnidad,
        estadoUnidad: 'activa',
      },
    });

    await this.registrarAuditoria(perfilId, 'unidad.creada', 'unidad_organica', unidad.id, null, dto);
    return unidad;
  }

  // ─────────────────────────────────────────────
  // UNIDADES — EDITAR
  // ─────────────────────────────────────────────
  async editarUnidad(entidadId: string, unidadId: string, dto: Partial<CreateUnidadDto>, perfilId: string) {
    await this.verificarAdminEntidadOSistema(perfilId, entidadId);

    const unidad = await this.prisma.unidadOrganica.findFirst({
      where: { id: unidadId, entidadPublicaId: entidadId },
    });
    if (!unidad) throw new NotFoundException('Unidad no encontrada');

    if (unidad.estadoUnidad === 'archivada') {
      throw new BadRequestException('No se puede editar una unidad archivada');
    }

    const actualizada = await this.prisma.unidadOrganica.update({
      where: { id: unidadId },
      data: dto,
    });

    await this.registrarAuditoria(perfilId, 'unidad.editada', 'unidad_organica', unidadId, unidad, dto);
    return actualizada;
  }

  // ─────────────────────────────────────────────
  // UNIDADES — CAMBIAR ESTADO
  // ─────────────────────────────────────────────
  async cambiarEstadoUnidad(
    entidadId: string,
    unidadId: string,
    dto: CambiarEstadoUnidadDto,
    perfilId: string,
  ) {
    await this.verificarAdminEntidadOSistema(perfilId, entidadId);

    const unidad = await this.prisma.unidadOrganica.findFirst({
      where: { id: unidadId, entidadPublicaId: entidadId },
    });
    if (!unidad) throw new NotFoundException('Unidad no encontrada');

    if (unidad.estadoUnidad === 'archivada' && dto.estado !== 'activa') {
      throw new BadRequestException('Una unidad archivada no puede cambiar de estado');
    }

    const ahora = new Date();
    const data: any = {
      estadoUnidad: dto.estado,
      ...(dto.estado === 'suspendida' && { fechaSuspension: ahora }),
      ...(dto.estado === 'archivada' && { fechaArchivado: ahora }),
      ...(dto.estado === 'activa' && { fechaSuspension: null }),
    };

    await this.prisma.unidadOrganica.update({ where: { id: unidadId }, data });

    await this.registrarAuditoria(
      perfilId,
      `unidad.${dto.estado}`,
      'unidad_organica',
      unidadId,
      { estadoUnidad: unidad.estadoUnidad },
      { estadoUnidad: dto.estado, motivo: dto.motivo },
    );

    return { message: `Unidad ${dto.estado} correctamente` };
  }
}
