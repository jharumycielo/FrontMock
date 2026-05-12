import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto';
import { AgregarPerfilDto } from './dto/agregar-perfil.dto';
import { InvitacionDto } from './dto/invitacion.dto';

@Injectable()
export class IdentityService {
  constructor(private readonly prisma: PrismaService) {}

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────

  // Verifica que el solicitante puede actuar sobre la entidad destino
  private async verificarAccesoEntidad(
    perfilId: string,
    entidadDestinoId: string,
  ) {
    const perfil = await this.prisma.usuarioEntidadRol.findUnique({
      where: { id: perfilId },
      include: { rol: true },
    });

    if (!perfil) throw new ForbiddenException('Perfil no encontrado');

    const esAdminSistema = perfil.rol.codigo === 'ADMIN_SISTEMA';
    const esAdminEntidad = perfil.rol.codigo === 'ADMIN_ENTIDAD';

    if (!esAdminSistema && !esAdminEntidad) {
      throw new ForbiddenException('No tiene permisos para gestionar usuarios');
    }

    // ADMIN_ENTIDAD solo puede actuar sobre su propia entidad
    if (esAdminEntidad && perfil.entidadPublicaId !== entidadDestinoId) {
      throw new ForbiddenException('Solo puede gestionar usuarios de su entidad');
    }

    return { perfil, esAdminSistema };
  }

  // ─────────────────────────────────────────────
  // CREAR USUARIO
  // ─────────────────────────────────────────────
  async crear(dto: CreateUsuarioDto, perfilId: string) {
    // Verificar permisos sobre la primera entidad del perfil
    const primeraEntidad = dto.perfiles[0].entidadPublicaId;
    const { esAdminSistema } = await this.verificarAccesoEntidad(perfilId, primeraEntidad);

    // ADMIN_ENTIDAD no puede crear ADMIN_SISTEMA
    if (!esAdminSistema) {
      const rolAdminSistema = await this.prisma.rol.findUnique({
        where: { codigo: 'ADMIN_SISTEMA' },
      });
      const intentaCrearAdminSistema = dto.perfiles.some(
        p => p.rolId === rolAdminSistema?.id,
      );
      if (intentaCrearAdminSistema) {
        throw new ForbiddenException('No puede asignar el rol ADMIN_SISTEMA');
      }
    }

    // Verificar unicidad de DNI y email
    const existeDni = await this.prisma.usuario.findUnique({ where: { dni: dto.dni } });
    if (existeDni) throw new BadRequestException('El DNI ya está registrado');

    const existeEmail = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
    if (existeEmail) throw new BadRequestException('El email ya está registrado');

    // Verificar que no hay dos perfiles con esPrincipal = true
    const principales = dto.perfiles.filter(p => p.esPrincipal);
    if (principales.length > 1) {
      throw new BadRequestException('Solo un perfil puede ser el principal');
    }

    // Si ninguno es principal, el primero lo es por defecto
    const perfilesConPrincipal = dto.perfiles.map((p, i) => ({
      ...p,
      esPrincipal: p.esPrincipal ?? i === 0,
    }));

    // Generar password temporal
    const passwordTemporal = `Siaf${Math.floor(1000 + Math.random() * 9000)}*`;
    const passwordHash = await bcrypt.hash(passwordTemporal, 10);

    // Crear usuario con perfiles
    const usuario = await this.prisma.usuario.create({
      data: {
        dni: dto.dni,
        nombres: dto.nombres,
        apellidos: dto.apellidos,
        email: dto.email,
        passwordHash,
        estado: 'activo',
        debeCambiarPassword: true,
        createdBy: perfilId,
        perfiles: {
          create: perfilesConPrincipal.map(p => ({
            entidadPublicaId: p.entidadPublicaId,
            unidadOrganicaId: p.unidadOrganicaId ?? null,
            rolId: p.rolId,
            ambito: p.ambito as any,
            esPrincipal: p.esPrincipal!,
            esActivo: true,
            fechaInicio: new Date(),
            createdBy: perfilId,
          })),
        },
      },
      include: {
        perfiles: {
          include: {
            entidadPublica: { select: { nombre: true } },
            unidadOrganica: { select: { nombre: true } },
            rol: { select: { nombre: true, codigo: true } },
          },
        },
      },
    });

    // Auditoría
    await this.prisma.auditoriaEvento.create({
      data: {
        usuarioId: (await this.prisma.usuarioEntidadRol.findUnique({
          where: { id: perfilId },
        }))!.usuarioId,
        perfilId,
        accion: 'usuario.creado',
        tablaAfectada: 'usuario',
        registroId: usuario.id,
        valorNuevo: { dni: usuario.dni, email: usuario.email },
      },
    });

    return {
      ...usuario,
      passwordTemporal, // devolver solo en la creación para que el admin lo comparta
    };
  }

  // ─────────────────────────────────────────────
  // LISTAR USUARIOS
  // ─────────────────────────────────────────────
  async listar(perfilId: string) {
    const perfil = await this.prisma.usuarioEntidadRol.findUnique({
      where: { id: perfilId },
      include: { rol: true },
    });

    if (!perfil) throw new ForbiddenException('Perfil no encontrado');

    const esAdminSistema = perfil.rol.codigo === 'ADMIN_SISTEMA';

    // ADMIN_SISTEMA ve todos — ADMIN_ENTIDAD solo los de su entidad
    const where = esAdminSistema
      ? {}
      : {
          perfiles: {
            some: { entidadPublicaId: perfil.entidadPublicaId },
          },
        };

    return this.prisma.usuario.findMany({
      where,
      select: {
        id: true,
        dni: true,
        nombres: true,
        apellidos: true,
        email: true,
        estado: true,
        ultimoAcceso: true,
        createdAt: true,
        perfiles: {
          where: { esActivo: true },
          include: {
            entidadPublica: { select: { nombre: true } },
            unidadOrganica: { select: { nombre: true } },
            rol: { select: { nombre: true, codigo: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─────────────────────────────────────────────
  // OBTENER USUARIO POR ID
  // ─────────────────────────────────────────────
  async obtenerPorId(id: string, perfilId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        dni: true,
        nombres: true,
        apellidos: true,
        email: true,
        estado: true,
        debeCambiarPassword: true,
        ultimoAcceso: true,
        createdAt: true,
        updatedAt: true,
        perfiles: {
          include: {
            entidadPublica: { select: { id: true, nombre: true } },
            unidadOrganica: { select: { id: true, nombre: true } },
            rol: { select: { id: true, nombre: true, codigo: true } },
          },
        },
      },
    });

    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    // Verificar acceso
    const perfilSolicitante = await this.prisma.usuarioEntidadRol.findUnique({
      where: { id: perfilId },
      include: { rol: true },
    });

    const esAdminSistema = perfilSolicitante?.rol.codigo === 'ADMIN_SISTEMA';

    if (!esAdminSistema) {
      // ADMIN_ENTIDAD solo puede ver usuarios de su entidad
      const perteneceAEntidad = usuario.perfiles.some(
        p => p.entidadPublicaId === perfilSolicitante?.entidadPublicaId,
      );
      if (!perteneceAEntidad) {
        throw new ForbiddenException('No tiene acceso a este usuario');
      }
    }

    return usuario;
  }

  // ─────────────────────────────────────────────
  // EDITAR USUARIO
  // ─────────────────────────────────────────────
  async editar(id: string, dto: UpdateUsuarioDto, perfilId: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    // Verificar email único si se está cambiando
    if (dto.email && dto.email !== usuario.email) {
      const existeEmail = await this.prisma.usuario.findUnique({
        where: { email: dto.email },
      });
      if (existeEmail) throw new BadRequestException('El email ya está en uso');
    }

    const actualizado = await this.prisma.usuario.update({
      where: { id },
      data: {
        ...dto,
        updatedBy: perfilId,
      },
      select: {
        id: true, dni: true, nombres: true, apellidos: true, email: true, estado: true,
      },
    });

    await this.prisma.auditoriaEvento.create({
      data: {
        usuarioId: (await this.prisma.usuarioEntidadRol.findUnique({
          where: { id: perfilId },
        }))!.usuarioId,
        perfilId,
        accion: 'usuario.editado',
        tablaAfectada: 'usuario',
        registroId: id,
        valorNuevo: dto as any,
      },
    });

    return actualizado;
  }

  // ─────────────────────────────────────────────
  // CAMBIAR ESTADO
  // ─────────────────────────────────────────────
  async cambiarEstado(id: string, dto: CambiarEstadoDto, perfilId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: { perfiles: { where: { esActivo: true } } },
    });

    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    // Verificar acceso sobre la entidad del usuario
    const primeraEntidad = usuario.perfiles[0]?.entidadPublicaId;
    if (primeraEntidad) {
      await this.verificarAccesoEntidad(perfilId, primeraEntidad);
    }

    await this.prisma.usuario.update({
      where: { id },
      data: { estado: dto.estado as any, updatedBy: perfilId },
    });

    await this.prisma.auditoriaEvento.create({
      data: {
        usuarioId: (await this.prisma.usuarioEntidadRol.findUnique({
          where: { id: perfilId },
        }))!.usuarioId,
        perfilId,
        accion: `usuario.${dto.estado}`,
        tablaAfectada: 'usuario',
        registroId: id,
        valorAnterior: { estado: usuario.estado },
        valorNuevo: { estado: dto.estado, motivo: dto.motivo },
      },
    });

    return { message: `Usuario ${dto.estado} correctamente` };
  }

  // ─────────────────────────────────────────────
  // AGREGAR PERFIL
  // ─────────────────────────────────────────────
  async agregarPerfil(usuarioId: string, dto: AgregarPerfilDto, perfilId: string) {
    await this.verificarAccesoEntidad(perfilId, dto.entidadPublicaId);

    const usuario = await this.prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    // Verificar que no existe ya ese perfil
    const existePerfil = await this.prisma.usuarioEntidadRol.findFirst({
      where: {
        usuarioId,
        entidadPublicaId: dto.entidadPublicaId,
        rolId: dto.rolId,
        esActivo: true,
      },
    });

    if (existePerfil) {
      throw new BadRequestException('El usuario ya tiene ese perfil en esa entidad');
    }

    // Si esPrincipal = true, quitar el principal anterior
    if (dto.esPrincipal) {
      await this.prisma.usuarioEntidadRol.updateMany({
        where: { usuarioId, esPrincipal: true },
        data: { esPrincipal: false },
      });
    }

    const perfil = await this.prisma.usuarioEntidadRol.create({
      data: {
        usuarioId,
        entidadPublicaId: dto.entidadPublicaId,
        unidadOrganicaId: dto.unidadOrganicaId ?? null,
        rolId: dto.rolId,
        ambito: dto.ambito as any,
        esPrincipal: dto.esPrincipal ?? false,
        esActivo: true,
        fechaInicio: new Date(),
        createdBy: perfilId,
      },
      include: {
        entidadPublica: { select: { nombre: true } },
        unidadOrganica: { select: { nombre: true } },
        rol: { select: { nombre: true, codigo: true } },
      },
    });

    return perfil;
  }

  // ─────────────────────────────────────────────
  // QUITAR PERFIL
  // ─────────────────────────────────────────────
  async quitarPerfil(usuarioId: string, perfilIdTarget: string, perfilId: string) {
    const perfil = await this.prisma.usuarioEntidadRol.findFirst({
      where: { id: perfilIdTarget, usuarioId },
    });

    if (!perfil) throw new NotFoundException('Perfil no encontrado');

    await this.verificarAccesoEntidad(perfilId, perfil.entidadPublicaId);

    // No se puede quitar el único perfil activo
    const totalPerfiles = await this.prisma.usuarioEntidadRol.count({
      where: { usuarioId, esActivo: true },
    });

    if (totalPerfiles <= 1) {
      throw new BadRequestException('El usuario debe tener al menos un perfil activo');
    }

    await this.prisma.usuarioEntidadRol.update({
      where: { id: perfilIdTarget },
      data: { esActivo: false, fechaFin: new Date() },
    });

    return { message: 'Perfil removido correctamente' };
  }

  // ─────────────────────────────────────────────
  // CREAR INVITACIÓN
  // ─────────────────────────────────────────────
  async crearInvitacion(dto: InvitacionDto, perfilId: string) {
    await this.verificarAccesoEntidad(perfilId, dto.entidadPublicaId);

    const solicitante = await this.prisma.usuarioEntidadRol.findUnique({
      where: { id: perfilId },
    });

    // Token válido por 48 horas
    const token = crypto.randomUUID();
    const tokenHash = await bcrypt.hash(token, 10);
    const expiraEn = new Date();
    expiraEn.setHours(expiraEn.getHours() + 48);

    await this.prisma.usuarioInvitacion.create({
      data: {
        email: dto.email,
        entidadPublicaId: dto.entidadPublicaId,
        unidadOrganicaId: dto.unidadOrganicaId ?? null,
        rolId: dto.rolId,
        tokenHash,
        expiraEn,
        createdBy: solicitante!.usuarioId,
      },
    });

    // TODO: enviar email con el enlace de invitación
    // El token sin hash es el que va en el enlace
    return {
      message: 'Invitación creada correctamente',
      email: dto.email,
      expiraEn,
      // En producción NO devolver el token — solo enviarlo por email
      tokenDemo: token,
    };
  }
}
