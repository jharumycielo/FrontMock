import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from '../prisma/prisma.service';

export interface NotificacionPayload {
  usuarioId: string;
  solicitudId: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  emailDestino: string;
  nombreDestino: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly mailer: MailerService,
    private readonly prisma: PrismaService,
  ) {}

  // ─────────────────────────────────────────────
  // CREAR NOTIFICACIÓN + ENVIAR EMAIL
  // ─────────────────────────────────────────────
  async notificar(payload: NotificacionPayload) {
    // 1. Guardar en BD
    await this.prisma.notificacion.create({
      data: {
        usuarioId: payload.usuarioId,
        solicitudId: payload.solicitudId,
        tipo: payload.tipo,
        titulo: payload.titulo,
        mensaje: payload.mensaje,
      },
    });

    // 2. Enviar email
    try {
      await this.mailer.sendMail({
        to: payload.emailDestino,
        subject: payload.titulo,
        html: this.plantillaEmail(payload.nombreDestino, payload.titulo, payload.mensaje),
      });

      // Marcar email como enviado
      await this.prisma.notificacion.updateMany({
        where: {
          usuarioId: payload.usuarioId,
          solicitudId: payload.solicitudId,
          tipo: payload.tipo,
          emailEnviado: false,
        },
        data: {
          emailEnviado: true,
          emailEnviadoEn: new Date(),
        },
      });

      this.logger.log(`Email enviado a ${payload.emailDestino} — ${payload.tipo}`);
    } catch (error) {
      this.logger.error(`Error enviando email a ${payload.emailDestino}: ${error.message}`);
      // No lanzar error — la operación principal no debe fallar por el email
    }
  }

  // ─────────────────────────────────────────────
  // EVENTOS DEL SISTEMA
  // ─────────────────────────────────────────────

  async notificarSolicitudVerificada(solicitudId: string) {
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { id: solicitudId },
      include: {
        tipoDocumento: { select: { nombre: true } },
        entidadDestino: { select: { nombre: true } },
      },
    });
    if (!solicitud) return;

    // Buscar los aprobadores destino
    const aprobadores = await this.prisma.usuarioEntidadRol.findMany({
      where: {
        entidadPublicaId: solicitud.entidadDestinoId!,
        unidadOrganicaId: solicitud.unidadDestinoId,
        rolId: solicitud.rolDestinoId!,
        esActivo: true,
      },
      include: { usuario: { select: { id: true, email: true, nombres: true, apellidos: true } } },
    });

    for (const aprobador of aprobadores) {
      await this.notificar({
        usuarioId: aprobador.usuario.id,
        solicitudId,
        tipo: 'solicitud_verificada',
        titulo: 'Nueva solicitud en su bandeja',
        mensaje: `Tiene una nueva solicitud "${solicitud.tipoDocumento.nombre}" con número ${solicitud.numeroSolicitud} pendiente de revisión.`,
        emailDestino: aprobador.usuario.email,
        nombreDestino: `${aprobador.usuario.nombres} ${aprobador.usuario.apellidos}`,
      });
    }
  }

  async notificarSolicitudObservada(solicitudId: string, comentario: string) {
    await this.notificarCreador(
      solicitudId,
      'solicitud_observada',
      'Solicitud observada — requiere corrección',
      `Su solicitud ha sido observada. Comentario del revisor: "${comentario}". Por favor corrija y reenvíe.`,
    );
  }

  async notificarSolicitudRechazada(solicitudId: string, comentario: string) {
    await this.notificarCreador(
      solicitudId,
      'solicitud_rechazada',
      'Solicitud rechazada',
      `Su solicitud ha sido rechazada. Motivo: "${comentario}".`,
    );
  }

  async notificarSolicitudAprobada(solicitudId: string) {
    await this.notificarCreador(
      solicitudId,
      'solicitud_aprobada',
      'Solicitud aprobada',
      `Su solicitud con número ${await this.getNumero(solicitudId)} ha sido aprobada. Las cuentas contables han sido registradas en el plan oficial.`,
    );
  }

  // ─────────────────────────────────────────────
  // NOTIFICACIONES NO LEÍDAS
  // ─────────────────────────────────────────────
  async obtenerNoLeidas(usuarioId: string) {
    return this.prisma.notificacion.findMany({
      where: { usuarioId, leida: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  async marcarLeidas(usuarioId: string) {
    await this.prisma.notificacion.updateMany({
      where: { usuarioId, leida: false },
      data: { leida: true, leidaEn: new Date() },
    });
    return { message: 'Notificaciones marcadas como leídas' };
  }

  async contarNoLeidas(usuarioId: string) {
    const total = await this.prisma.notificacion.count({
      where: { usuarioId, leida: false },
    });
    return { total };
  }

  // ─────────────────────────────────────────────
  // HELPERS PRIVADOS
  // ─────────────────────────────────────────────
  private async notificarCreador(
    solicitudId: string,
    tipo: string,
    titulo: string,
    mensaje: string,
  ) {
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { id: solicitudId },
      include: {
        perfilCreador: {
          include: {
            usuario: { select: { id: true, email: true, nombres: true, apellidos: true } },
          },
        },
      },
    });
    if (!solicitud) return;

    const creador = solicitud.perfilCreador.usuario;
    await this.notificar({
      usuarioId: creador.id,
      solicitudId,
      tipo,
      titulo,
      mensaje,
      emailDestino: creador.email,
      nombreDestino: `${creador.nombres} ${creador.apellidos}`,
    });
  }

  private async getNumero(solicitudId: string): Promise<string> {
    const s = await this.prisma.solicitud.findUnique({
      where: { id: solicitudId },
      select: { numeroSolicitud: true },
    });
    return s?.numeroSolicitud ?? solicitudId;
  }

  private plantillaEmail(nombre: string, titulo: string, mensaje: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px;">
          <div style="background: #1a56db; padding: 20px; border-radius: 6px 6px 0 0; margin: -30px -30px 20px;">
            <h2 style="color: white; margin: 0;">SIAF-RP</h2>
          </div>
          <p style="color: #333;">Estimado/a <strong>${nombre}</strong>,</p>
          <h3 style="color: #1a56db;">${titulo}</h3>
          <p style="color: #555; line-height: 1.6;">${mensaje}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            Este es un mensaje automático del sistema SIAF-RP. No responda a este correo.
          </p>
        </div>
      </body>
      </html>
    `;
  }
}
