import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: this.config.get('CLOUDINARY_CLOUD_NAME'),
      api_key:    this.config.get('CLOUDINARY_API_KEY'),
      api_secret: this.config.get('CLOUDINARY_API_SECRET'),
    });
  }

  // ─────────────────────────────────────────────
  // SUBIR ARCHIVO DE SUSTENTO
  // ─────────────────────────────────────────────
  async subirSustento(
    solicitudId: string,
    tipoSustento: string,
    file: Express.Multer.File,
    perfilId: string,
  ) {
    // 1. Verificar que la solicitud existe
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { id: solicitudId },
    });
    if (!solicitud) throw new NotFoundException('Solicitud no encontrada');

    // 2. Solo se puede adjuntar en NUEVO, ELABORADO u OBSERVADO
    if (!['NUEVO', 'ELABORADO', 'OBSERVADO'].includes(solicitud.estado)) {
      throw new BadRequestException(
        `No se pueden adjuntar archivos en estado ${solicitud.estado}`,
      );
    }

    // 3. Verificar que el perfil es el creador
    if (solicitud.perfilCreadorId !== perfilId) {
      throw new ForbiddenException('Solo el creador puede adjuntar archivos');
    }

    // 4. Validar MIME type real (solo PDF)
    const mimePermitidos = ['application/pdf'];
    if (!mimePermitidos.includes(file.mimetype)) {
      throw new BadRequestException('Solo se permiten archivos PDF');
    }

    // 5. Validar tamaño (10MB)
    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new BadRequestException('El archivo no puede superar los 10MB');
    }

    // 6. Subir a Cloudinary
    const nombreStorage = `siaf_${solicitudId}_${Date.now()}`;

    const resultado = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'siaf-rp/sustentos',
          public_id: nombreStorage,
          resource_type: 'raw', // para PDFs
          format: 'pdf',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      ).end(file.buffer);
    });

    // 7. Guardar metadata en BD
    const perfil = await this.prisma.usuarioEntidadRol.findUnique({
      where: { id: perfilId },
    });

    const archivo = await this.prisma.archivo.create({
      data: {
        nombreOriginal: file.originalname,
        nombreStorage: nombreStorage,
        extension: 'pdf',
        mimeType: file.mimetype,
        sizeBytes: file.size,
        storagePath: resultado.secure_url,
        createdBy: perfil!.usuarioId,
      },
    });

    // 8. Crear relación solicitud → archivo
    const sustento = await this.prisma.solicitudSustento.create({
      data: {
        solicitudId,
        archivoId: archivo.id,
        tipoSustento: tipoSustento ?? 'OFICIO',
      },
      include: {
        archivo: true,
      },
    });

    // 9. Auditoría
    await this.prisma.auditoriaEvento.create({
      data: {
        usuarioId: perfil!.usuarioId,
        perfilId,
        accion: 'archivo.subido',
        tablaAfectada: 'archivo',
        registroId: archivo.id,
        valorNuevo: {
          nombre: file.originalname,
          size: file.size,
          solicitudId,
        },
      },
    });

    return sustento;
  }

  // ─────────────────────────────────────────────
  // LISTAR SUSTENTOS DE UNA SOLICITUD
  // ─────────────────────────────────────────────
  async listarSustentos(solicitudId: string) {
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { id: solicitudId },
    });
    if (!solicitud) throw new NotFoundException('Solicitud no encontrada');

    return this.prisma.solicitudSustento.findMany({
      where: { solicitudId },
      include: {
        archivo: {
          select: {
            id: true,
            nombreOriginal: true,
            extension: true,
            mimeType: true,
            sizeBytes: true,
            storagePath: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ─────────────────────────────────────────────
  // ELIMINAR SUSTENTO
  // ─────────────────────────────────────────────
  async eliminarSustento(
    solicitudId: string,
    sustentoId: string,
    perfilId: string,
  ) {
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { id: solicitudId },
    });
    if (!solicitud) throw new NotFoundException('Solicitud no encontrada');

    // Solo en NUEVO, ELABORADO u OBSERVADO
    if (!['NUEVO', 'ELABORADO', 'OBSERVADO'].includes(solicitud.estado)) {
      throw new BadRequestException(
        `No se pueden eliminar archivos en estado ${solicitud.estado}`,
      );
    }

    // Solo el creador
    if (solicitud.perfilCreadorId !== perfilId) {
      throw new ForbiddenException('Solo el creador puede eliminar archivos');
    }

    const sustento = await this.prisma.solicitudSustento.findFirst({
      where: { id: sustentoId, solicitudId },
      include: { archivo: true },
    });
    if (!sustento) throw new NotFoundException('Sustento no encontrado');

    // Eliminar de Cloudinary
    await cloudinary.uploader.destroy(
      `siaf-rp/sustentos/${sustento.archivo.nombreStorage}`,
      { resource_type: 'raw' },
    );

    // Eliminar de BD
    await this.prisma.solicitudSustento.delete({ where: { id: sustentoId } });
    await this.prisma.archivo.delete({ where: { id: sustento.archivoId } });

    return { message: 'Archivo eliminado correctamente' };
  }
}
