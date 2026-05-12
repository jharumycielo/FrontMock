/**
 * Script para inicializar la sesión de WhatsApp.
 * Ejecutar UNA VEZ para escanear el QR y guardar la sesión.
 *
 * Uso:
 *   npx ts-node src/whatsapp/init-whatsapp.ts
 *
 * Una vez escaneado el QR y conectado, presiona Ctrl+C.
 * La sesión queda guardada en: backend/whatsapp_session/
 * El servidor NestJS la usará automáticamente al arrancar.
 */

import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
} from '@whiskeysockets/baileys';
import * as qrcode from 'qrcode-terminal';
import { Boom } from '@hapi/boom';
import * as path from 'path';

const SESSION_PATH = path.join(process.cwd(), 'whatsapp_session');

async function iniciarSesion() {
  console.log('\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📱  SIAF-RP — Configuración inicial de WhatsApp   ');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📂  Sesión guardada en: ${SESSION_PATH}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_PATH);

  const sock = makeWASocket({
    auth: state,
    browser: Browsers.macOS('SIAF-RP'),
    printQRInTerminal: false, // lo manejamos nosotros
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    // Mostrar QR cuando aparece
    if (qr) {
      console.log('\n🔳 Escanea este QR con tu WhatsApp:');
      console.log('   (WhatsApp → Dispositivos vinculados → Vincular dispositivo)\n');
      qrcode.generate(qr, { small: true });
      console.log('\n⏳ Esperando que escanees el QR...\n');
    }

    if (connection === 'open') {
      console.log('\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅  ¡WhatsApp conectado exitosamente!             ');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📁  Sesión guardada. Ya puedes cerrar este script.');
      console.log('🚀  Ahora inicia el servidor con: npm run start:dev');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    if (connection === 'close') {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;

      if (shouldReconnect) {
        console.log('🔄 Reconectando...');
        iniciarSesion();
      } else {
        console.log('❌ Sesión cerrada. Vuelve a ejecutar el script.');
        process.exit(0);
      }
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

iniciarSesion().catch(console.error);
