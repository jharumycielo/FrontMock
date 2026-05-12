import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import * as path from 'path';
import * as fs from 'fs';

const SESSION_PATH = path.join(process.cwd(), 'whatsapp_session');

@Injectable()
export class WhatsappService implements OnModuleInit {
  private readonly logger = new Logger(WhatsappService.name);
  private sock: any;
  private isReady = false;

  async onModuleInit() {
    // Solo iniciar si existe la sesión guardada
    if (fs.existsSync(SESSION_PATH)) {
      setTimeout(() => this.conectar(), 2000);
    } else {
      this.logger.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      this.logger.warn('⚠️  WhatsApp no configurado todavía.');
      this.logger.warn('   Ejecuta: npx ts-node src/whatsapp/init-whatsapp.ts');
      this.logger.warn('   para escanear el QR y guardar la sesión.');
      this.logger.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
  }

  private async conectar() {
    try {
      const { state, saveCreds } = await useMultiFileAuthState(SESSION_PATH);

      this.sock = makeWASocket({
        auth: state,
        browser: Browsers.macOS('SIAF-RP'),
        printQRInTerminal: false,
      });

      this.sock.ev.on('connection.update', async (update: any) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
          this.isReady = true;
          this.logger.log('✅ WhatsApp conectado y listo para enviar mensajes');
        }

        if (connection === 'close') {
          this.isReady = false;
          const shouldReconnect =
            (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;

          if (shouldReconnect) {
            this.logger.warn('🔄 WhatsApp desconectado. Reconectando...');
            setTimeout(() => this.conectar(), 5000);
          } else {
            this.logger.warn('❌ Sesión de WhatsApp cerrada. Re-ejecuta init-whatsapp.ts');
          }
        }
      });

      this.sock.ev.on('creds.update', saveCreds);

    } catch (error) {
      this.logger.error('❌ Error conectando WhatsApp:', error.message);
    }
  }

  // ─────────────────────────────────────────────
  // ENVIAR OTP POR WHATSAPP
  // ─────────────────────────────────────────────
  async enviarOtp(telefono: string, codigo: string): Promise<boolean> {
    if (!this.isReady || !this.sock) {
      this.logger.warn('WhatsApp no está conectado');
      return false;
    }

    try {
      const numero = telefono.replace('+', '').replace(/\s/g, '');

      const mensaje =
        `🔐 *SIAF-RP — Código de verificación*\n\n` +
        `Tu código OTP es:\n\n` +
        `*${codigo}*\n\n` +
        `⏱️ Válido por 10 minutos.\n` +
        `Si no solicitaste este código, ignora este mensaje.`;

      await this.sock.sendMessage(`${numero}@s.whatsapp.net`, { text: mensaje });

      this.logger.log(`✅ OTP enviado por WhatsApp a ${telefono}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Error enviando WhatsApp a ${telefono}:`, error.message);
      return false;
    }
  }

  get botListo(): boolean {
    return this.isReady;
  }
}
