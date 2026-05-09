# SIAF-RP — Backend

API REST construida con **NestJS**, **Prisma** y **PostgreSQL** para el Sistema Integrado de Administración Financiera (SIAF-RP).

---

## Stack

| Tecnología | Rol |
|---|---|
| NestJS 10 | Framework HTTP |
| Prisma 5 | ORM y migraciones |
| PostgreSQL | Base de datos |
| JWT | Autenticación |
| class-validator | Validación de DTOs |

---

## Estructura de carpetas

```
backend/
├── prisma/
│   ├── schema.prisma        # Modelo completo de la base de datos
│   └── migrations/          # Historial de migraciones (generado por Prisma)
├── src/
│   ├── prisma/
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   ├── auth/                # Login, JWT, refresh tokens
│   ├── identity/            # Usuarios, roles, permisos, perfiles
│   ├── organization/        # Entidades públicas, unidades orgánicas
│   ├── requests/            # Solicitudes, historial de estados, bandejas
│   ├── chart-accounts/      # Plan contable y cuentas contables
│   ├── documents/           # Archivos y sustentos
│   ├── audit/               # Auditoría de eventos
│   ├── app.module.ts
│   └── main.ts
├── .env                     # Variables de entorno (no commitear)
├── .env.example             # Plantilla de variables
├── nest-cli.json
├── package.json
└── tsconfig.json
```

---

## Configuración inicial

### 1. Copiar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con los valores reales:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/siaf_rp_dev"
JWT_SECRET="un_secreto_seguro"
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

> Ejecutar solo cuando la base de datos esté lista y el modelo estabilizado.

```bash
npx prisma migrate dev --name init
```

### 5. Levantar el servidor en desarrollo

```bash
npm run start:dev
```

La API queda disponible en `http://localhost:3000/api/v1`.

---

## Comandos útiles de Prisma

| Comando | Descripción |
|---|---|
| `npx prisma generate` | Regenera el client tras cambios en el schema |
| `npx prisma migrate dev --name <nombre>` | Crea y aplica una nueva migración |
| `npx prisma migrate deploy` | Aplica migraciones pendientes (producción/CI) |
| `npx prisma studio` | Explorador visual de la base de datos |
| `npx prisma validate` | Valida la sintaxis del schema |
| `npx prisma db seed` | Ejecuta el seed (cuando esté configurado) |

---

## Modelo de datos

El schema completo está en [`prisma/schema.prisma`](prisma/schema.prisma).

### Módulos principales

| Módulo | Tablas |
|---|---|
| Seguridad | `usuario`, `rol`, `permiso`, `rol_permiso` |
| Perfiles | `usuario_entidad_rol`, `usuario_sesion`, `usuario_invitacion` |
| Organización | `entidad_publica`, `unidad_organica` |
| Módulos UI | `modulo`, `modulo_permiso` |
| Plan contable | `plan_contable`, `cuenta_contable`, `ambito_institucional` |
| Solicitudes | `solicitud`, `solicitud_cuenta_contable`, `solicitud_estado_historial` |
| Archivos | `archivo`, `solicitud_sustento` |
| Auditoría | `auditoria_evento` |

### Enums

| Enum | Valores |
|---|---|
| `EstadoUsuario` | `activo`, `inactivo`, `bloqueado`, `pendiente_activacion` |
| `TipoEntidad` | `ministerio`, `municipalidad`, `gobierno_regional`, `unidad_ejecutora`, `organismo_publico`, `empresa_publica`, `otra` |
| `AmbitoAcceso` | `sistema`, `nacional`, `entidad`, `unidad` |
| `EstadoSolicitud` | `NUEVO`, `ELABORADO`, `VERIFICADO`, `OBSERVADO`, `APROBADO`, `RECHAZADO`, `ANULADO` |

### Flujo de una solicitud

```
Municipalidad (CREADOR)
  └─► crea solicitud
        └─► estado: NUEVO → ELABORADO → VERIFICADO
              └─► llega a bandeja de DGCP/MEF (APROBADOR)
                    └─► APROBADO / OBSERVADO / RECHAZADO
```

La bandeja del aprobador filtra por `entidad_destino_id + unidad_destino_id + rol_destino_id + estado`.

---

## Variables de entorno

| Variable | Descripción | Requerida |
|---|---|---|
| `DATABASE_URL` | Cadena de conexión PostgreSQL | Sí |
| `JWT_SECRET` | Secreto para firmar tokens | Sí |
| `JWT_EXPIRES_IN` | Duración del access token (ej. `15m`) | Sí |
| `JWT_REFRESH_EXPIRES_IN` | Duración del refresh token (ej. `7d`) | Sí |
| `PORT` | Puerto del servidor (default `3000`) | No |
| `FRONTEND_URL` | URL del frontend para CORS (default `http://localhost:4200`) | No |

---

## Roles del sistema

| Rol | Alcance |
|---|---|
| `ADMIN_SISTEMA` | Acceso total: entidades, usuarios, roles, auditoría global |
| `ADMIN_ENTIDAD` | Gestión de usuarios y accesos de su entidad |
| `ADMIN_UNIDAD` | Gestión de usuarios de su unidad |
| `CREADOR` | Crea y elabora solicitudes |
| `REVISOR` | Verifica solicitudes antes de aprobar |
| `APROBADOR` | Aprueba, observa o rechaza solicitudes |
| `CONSULTA` | Solo lectura |

---

## Roadmap de módulos

- [ ] `auth` — Login, refresh token, cambio de password
- [ ] `identity` — CRUD de usuarios, roles, permisos, perfiles
- [ ] `organization` — CRUD de entidades y unidades
- [ ] `chart-accounts` — Plan contable y cuentas
- [ ] `requests` — Solicitudes y bandejas por perfil
- [ ] `documents` — Upload y gestión de archivos de sustento
- [ ] `audit` — Registro de eventos del sistema
- [ ] `realtime` — Notificaciones vía Socket.IO
