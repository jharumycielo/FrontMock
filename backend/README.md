# SIAF-RP — Backend

API REST construida con **NestJS**, **Prisma** y **PostgreSQL (Neon)** para el Sistema Integrado de Administración Financiera (SIAF-RP).

---

## Stack

| Tecnología | Rol |
|---|---|
| NestJS 10 | Framework HTTP |
| Prisma 5 | ORM y migraciones |
| PostgreSQL 15 (Neon) | Base de datos cloud |
| JWT | Autenticación |
| Bcrypt | Hash de passwords y tokens |
| Cloudinary | Storage de archivos PDF |
| Nodemailer + Gmail | Notificaciones por email |
| Baileys (@whiskeysockets) | WhatsApp — OTP y notificaciones |
| class-validator | Validación de DTOs |

---

## Estructura de carpetas

```
backend/
├── prisma/
│   ├── schema.prisma        ← Modelo completo (25+ tablas)
│   ├── seed.ts              ← Datos iniciales
│   └── migrations/          ← Historial de migraciones
├── src/
│   ├── auth/                ← Login, JWT, OTP, refresh token
│   ├── identity/            ← Usuarios, perfiles, invitaciones
│   ├── organization/        ← Entidades públicas, unidades
│   ├── requests/            ← Solicitudes, bandejas, flujo de estados
│   ├── chart-accounts/      ← Plan contable, cuentas, catálogos
│   ├── documents/           ← Archivos PDF a Cloudinary
│   ├── notifications/       ← Email + almacenamiento en BD
│   ├── whatsapp/            ← OTP y mensajes por WhatsApp (Baileys)
│   │   ├── whatsapp.service.ts
│   │   ├── whatsapp.module.ts
│   │   └── init-whatsapp.ts ← script único para escanear QR
│   ├── prisma/              ← PrismaService global
│   ├── app.module.ts
│   └── main.ts
├── .env                     ← Variables de entorno (no commitear)
├── .env.example             ← Plantilla de variables
└── package.json
```

---

## Configuración inicial

### 1. Copiar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con los valores reales:

```env
DATABASE_URL="postgresql://neondb_owner:...@ep-...neon.tech/neondb?sslmode=require"
JWT_SECRET="un_secreto_seguro_aqui"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu_correo@gmail.com
MAIL_PASS=contraseña_app_16_chars
MAIL_FROM="SIAF-RP <tu_correo@gmail.com>"
PORT=3000
FRONTEND_URL="http://localhost:4200"
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Generar el Prisma Client

```bash
npx prisma generate
```

### 4. Crear las tablas en la base de datos

```bash
npx prisma migrate dev --name init
```

### 5. Cargar datos iniciales (seed)

```bash
npx prisma db seed
```

Esto crea:
- 7 roles (ADMIN_SISTEMA, CREADOR, APROBADOR, etc.)
- 27 permisos
- 8 módulos UI
- 12 ámbitos institucionales
- Entidad MEF con unidades DGCP y OGTI
- Usuario admin: DNI `00000001` / Password `Admin2025*`
- 2 tipos de documento contables (SCC, SCMPC)

### 6. Levantar el servidor

```bash
npm run start:dev
```

API disponible en `http://localhost:3000/api/v1`.

---

## Comandos Prisma

| Comando | Descripción |
|---|---|
| `npx prisma generate` | Regenera el client tras cambios en el schema |
| `npx prisma migrate dev --name <nombre>` | Crea y aplica una nueva migración |
| `npx prisma migrate deploy` | Aplica migraciones en producción/CI |
| `npx prisma studio` | Explorador visual de la base de datos |
| `npx prisma validate` | Valida la sintaxis del schema |
| `npx prisma db seed` | Ejecuta el seed |

---

## Endpoints disponibles

### Auth — `/api/v1/auth`
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/login` | DNI + password → tokens + perfil activo |
| POST | `/logout` | Revoca sesión actual |
| POST | `/refresh` | Renueva access token con refresh token |
| POST | `/cambiar-password` | Cambio de password (requiere JWT) |
| PATCH | `/cambiar-perfil` | Cambia perfil activo sin cerrar sesión |
| POST | `/solicitar-otp` | Envía código de 4 dígitos al email |
| POST | `/verificar-otp` | Valida OTP y actualiza password |
| POST | `/reenviar-otp-whatsapp` | Reenvía el mismo código por WhatsApp |

### Usuarios — `/api/v1/usuarios`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Listar usuarios (filtrado por entidad según rol) |
| POST | `/` | Crear usuario con perfil(es) |
| GET | `/:id` | Ver detalle de usuario |
| PATCH | `/:id` | Editar datos básicos |
| PATCH | `/:id/estado` | Activar / desactivar / bloquear |
| POST | `/:id/perfiles` | Agregar perfil |
| DELETE | `/:id/perfiles/:pid` | Quitar perfil |
| POST | `/invitacion` | Crear invitación por email |

### Entidades — `/api/v1/entidades`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Listar entidades |
| POST | `/` | Crear entidad (ADMIN_SISTEMA) |
| GET | `/:id` | Ver detalle |
| PATCH | `/:id` | Editar |
| PATCH | `/:id/estado` | Suspender / migrar / archivar |
| GET | `/:id/unidades` | Listar unidades de la entidad |
| POST | `/:id/unidades` | Crear unidad |
| PATCH | `/:id/unidades/:uid` | Editar unidad |
| PATCH | `/:id/unidades/:uid/estado` | Cambiar estado de unidad |

### Solicitudes — `/api/v1/solicitudes`
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/` | Crear solicitud (estado NUEVO) |
| GET | `/bandeja-creador` | Bandeja del CREADOR |
| GET | `/bandeja-aprobador` | Bandeja del APROBADOR |
| GET | `/:id` | Ver detalle completo |
| PATCH | `/:id/estado` | Cambiar estado (ELABORADO, VERIFICADO, etc.) |
| POST | `/:id/sustentos` | Subir archivo PDF de sustento |
| GET | `/:id/sustentos` | Listar archivos de sustento |
| DELETE | `/:id/sustentos/:sid` | Eliminar sustento |

### Plan Contable — `/api/v1/planes`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Listar planes |
| POST | `/` | Crear plan |
| GET | `/:id` | Ver plan |
| GET | `/:id/cuentas` | Listar cuentas del plan |

### Catálogos
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/v1/roles` | Listar roles |
| GET | `/api/v1/ambitos` | Listar ámbitos institucionales |
| GET | `/api/v1/tipos-documento` | Listar tipos de documento |
| GET | `/api/v1/cuentas/validar/codigo` | Validar código de cuenta |

### Notificaciones — `/api/v1/notificaciones`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Obtener no leídas |
| GET | `/contador` | Contar no leídas (badge navbar) |
| PATCH | `/marcar-leidas` | Marcar todas como leídas |

---

## Flujo completo de una solicitud

```
1. CREADOR crea solicitud          → estado: NUEVO (sin número)
2. CREADOR sube archivo PDF        → POST /solicitudes/:id/sustentos
3. CREADOR elabora                 → estado: ELABORADO, número: 1-2026-00001
4. CREADOR verifica                → estado: VERIFICADO
                                     → email automático al APROBADOR
5. APROBADOR ve en su bandeja      → GET /solicitudes/bandeja-aprobador
6a. APROBADOR aprueba              → estado: APROBADO
                                     → cuenta creada en plan oficial
                                     → email al CREADOR
6b. APROBADOR observa              → estado: OBSERVADO (comentario obligatorio)
                                     → email al CREADOR
6c. APROBADOR rechaza              → estado: RECHAZADO (comentario obligatorio)
                                     → email al CREADOR
```

---

## Numeración de solicitudes

Formato: `{codigoNumericoEntidad}-{año}-{correlativo}`

```
Ejemplo: 1-2026-00001
├── 1     → MEF (codigoNumerico = 1, asignado automáticamente)
├── 2026  → año actual
└── 00001 → correlativo por año (reinicia cada año)
```

---

## Roles y permisos

| Rol | Descripción |
|---|---|
| `ADMIN_SISTEMA` | OGTI — acceso total al sistema |
| `ADMIN_ENTIDAD` | Gestiona usuarios y accesos de su entidad |
| `ADMIN_UNIDAD` | Gestiona usuarios de su unidad |
| `CREADOR` | Crea y elabora solicitudes |
| `REVISOR` | Verifica solicitudes |
| `APROBADOR` | Aprueba, observa o rechaza |
| `CONSULTA` | Solo lectura |

---

## Configuración de WhatsApp (Baileys)

WhatsApp se usa para reenviar el código OTP cuando el usuario no tiene acceso a su correo.

### Primera configuración (una sola vez)

```bash
# 1. Para el servidor si está corriendo
# 2. Ejecuta el script de inicialización
npm run whatsapp:init

# 3. Escanea el QR que aparece en la terminal:
#    WhatsApp → ⋮ → Dispositivos vinculados → Vincular dispositivo

# 4. Cuando aparezca "✅ ¡WhatsApp conectado exitosamente!" → Ctrl+C

# 5. Reinicia el servidor normalmente
npm run start:dev
```

La sesión queda guardada en `backend/whatsapp_session/`.

### Comportamiento del servidor

```
Con sesión guardada  → WhatsApp conecta automáticamente al arrancar
Sin sesión guardada  → Muestra aviso y continúa sin WhatsApp
Sesión expirada      → "Sesión de WhatsApp cerrada" en terminal
                       → Ejecutar npm run whatsapp:init de nuevo
```

### Formato del teléfono

```
El campo telefono del usuario debe estar en formato internacional:
✅ +51987654321   ← Perú (código +51 + 9 dígitos)
✅ +1987654321    ← USA
❌ 987654321      ← sin código de país → no funciona
❌ 0987654321     ← con 0 inicial → no funciona
```

### Flujo OTP completo

```
1. POST /auth/solicitar-otp       → código enviado al EMAIL
2. Si no tiene acceso al correo:
   POST /auth/reenviar-otp-whatsapp → mismo código enviado por WHATSAPP
3. POST /auth/verificar-otp       → valida código y actualiza password
```

---

## Módulos pendientes de implementar

```
⬜ Socket.IO          → notificaciones en tiempo real
⬜ Auditoría          → módulo de consulta y exportación (Excel/PDF)
⬜ Carga masiva       → CSV/XLSX con validación fila por fila
⬜ Integración frontend → conectar Angular con los endpoints reales
```
