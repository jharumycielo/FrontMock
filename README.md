# SIAF-RP — Sistema Integrado de Administración Financiera de los Recursos Públicos

Aplicación web para la gestión de procesos financieros y contables del Estado Peruano. Construida con Angular 20 y Tailwind CSS 4, con un sistema de diseño propio basado en tokens exportados desde Figma. El backend está desarrollado con NestJS + Prisma + PostgreSQL (Neon).

---

## Stack tecnológico

### Frontend
| Herramienta | Versión |
|---|---|
| Angular | 20+ |
| Tailwind CSS | 4 |
| TypeScript | 5.9+ |
| RxJS | 7.8+ |
| Material Icons | 1.13+ |
| xlsx | 0.18+ |
| Node.js | >= 20.19.0 < 21 |
| NPM | >= 10 |

### Backend
| Herramienta | Versión |
|---|---|
| NestJS | 10 |
| Prisma ORM | 5 |
| PostgreSQL (Neon) | 15 |
| JWT | @nestjs/jwt 10 |
| Cloudinary | Storage de archivos PDF |
| Nodemailer | Notificaciones por email (Gmail) |
| Baileys | Notificaciones y OTP por WhatsApp |

---

## Instalación y desarrollo

### Frontend
```bash
npm install
npm start                # http://localhost:4200
npm run build
npm run typecheck
npm run tokens:build
```

### Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init   # primera vez
npm run start:dev                    # http://localhost:3000
```

---

## Estructura del proyecto

```
new-siaf-rp/
├── src/                          ← Frontend Angular
│   └── app/
│       ├── core/                 ← Auth, modelos, configuración global
│       │   ├── auth/             ← Roles, permisos, guards
│       │   ├── models/           ← Interfaces comunes
│       │   └── config/           ← App config + catálogo de procesos
│       ├── layout/               ← Shell del sistema
│       │   ├── shell/
│       │   ├── navbar/
│       │   ├── sidebar/
│       │   ├── virtual-desk/     ← Portal central (escritorio)
│       │   ├── admin-menu/       ← Panel de administración
│       │   ├── process-menu-tree/
│       │   ├── tray-menu/
│       │   ├── tray-documents-view/
│       │   └── create-document/
│       ├── shared/
│       │   ├── ui/               ← UI Kit puro (45+ componentes)
│       │   └── components/       ← Componentes con lógica de negocio
│       ├── modules/              ← Módulos de gestión (escalable)
│       │   ├── contabilidad/     ← Módulo de Gestión Contable
│       │   │   ├── plan-cuentas/
│       │   │   ├── asiento-ajuste/
│       │   │   └── config/       ← Mock data y configs
│       │   └── admin/            ← Administración (OGTI + ADMIN_ENTIDAD)
│       │       ├── usuarios/
│       │       ├── entidades/
│       │       ├── unidades/
│       │       └── auditoria/
│       └── features/             ← Solo páginas públicas
│           ├── login/
│           ├── otp-verification/
│           └── showcase/
├── backend/                      ← Backend NestJS
│   ├── prisma/
│   │   ├── schema.prisma         ← Modelo completo de BD
│   │   ├── seed.ts               ← Datos iniciales
│   │   └── migrations/
│   └── src/
│       ├── auth/                 ← Login, JWT, OTP
│       ├── identity/             ← Usuarios, perfiles
│       ├── organization/         ← Entidades, unidades
│       ├── requests/             ← Solicitudes, bandejas
│       ├── chart-accounts/       ← Plan contable, cuentas
│       ├── documents/            ← Archivos a Cloudinary
│       ├── notifications/        ← Email + BD
│       └── prisma/               ← PrismaService global
└── docs/                         ← Documentación del proyecto
    ├── reglas-negocio-siaf.md
    ├── propuesta-modelo-sql-siaf.md
    └── ...
```

---

## Rutas del frontend

### Públicas
| Ruta | Componente |
|---|---|
| `/login` | `LoginComponent` |
| `/login/recuperar-contrasena` | `OtpVerificationComponent` |
| `/showcase` | `ShowcaseComponent` |

### Módulo Contabilidad
| Ruta | Componente |
|---|---|
| `/panel` | `VirtualDeskComponent` |
| `/procesos/plan-cuentas-contables` | `ChartAccountsDocumentsComponent` |
| `/procesos/plan-cuentas-contables/solicitud` | `ChartAccountsRequestComponent` |
| `/procesos/plan-cuentas-contables/carga-masiva/solicitud` | `ChartAccountsBulkRequestComponent` |
| `/procesos/registro-asiento-ajuste` | `AdjustmentSeatDocumentsComponent` |
| `/procesos/registro-asiento-ajuste/solicitud` | `AdjustmentSeatRequestComponent` |
| `/procesos/registro-asiento-ajuste/formulario` | `AdjustmentSeatFormComponent` |

### Módulo Administración
| Ruta | Componente |
|---|---|
| `/admin/usuarios` | `AdminUsuariosComponent` |
| `/admin/usuarios/nuevo` | `AdminUsuariosFormComponent` |
| `/admin/entidades` | `AdminEntidadesComponent` |
| `/admin/entidades/nueva` | `AdminEntidadesFormComponent` |
| `/admin/auditoria` | `AdminAuditoriaComponent` |

---

## Endpoints del backend

### Auth — `POST /api/v1/auth/...`
| Endpoint | Descripción |
|---|---|
| `login` | DNI + password → tokens |
| `logout` | Revoca sesión |
| `refresh` | Renueva access token |
| `cambiar-password` | Cambio obligatorio primer acceso |
| `cambiar-perfil` | Cambia perfil activo sin cerrar sesión |
| `solicitar-otp` | Envía código 4 dígitos al email |
| `verificar-otp` | Valida código y actualiza password |

### Usuarios — `GET/POST/PATCH /api/v1/usuarios/...`
### Entidades — `GET/POST/PATCH /api/v1/entidades/...`
### Solicitudes — `GET/POST/PATCH /api/v1/solicitudes/...`
### Planes — `GET/POST /api/v1/planes/...`
### Notificaciones — `GET/PATCH /api/v1/notificaciones/...`

---

## Roles del sistema

| Rol (frontend) | Código backend | Alcance |
|---|---|---|
| `admin_sistema` | `ADMIN_SISTEMA` | OGTI — acceso total |
| `admin_entidad` | `ADMIN_ENTIDAD` | Gestiona su entidad |
| `creator` | `CREADOR` | Crea y elabora solicitudes |
| `reviewer` | `REVISOR` | Verifica solicitudes |
| `approver` | `APROBADOR` | Aprueba/rechaza/observa |

---

## Reglas de arquitectura

| Carpeta | Criterio |
|---|---|
| `shared/ui/` | Componentes presentacionales sin HTTP ni lógica SIAF |
| `shared/components/` | Componentes transversales con lógica compartida entre módulos |
| `layout/` | Componentes exclusivos del shell |
| `modules/[modulo]/` | Features por dominio — contabilidad, presupuesto, etc. |
| `modules/admin/` | Pantallas de administración del sistema |
| `features/` | Solo páginas públicas (login, otp, showcase) |

Reglas:
- Los módulos no se importan entre sí
- Si algo se necesita en dos módulos, sube a `shared/components/`
- `shared/ui/` nunca importa desde `shared/components/`, `layout/` ni `modules/`
- Cada módulo futuro (presupuesto, tesorería, abastecimiento) se agrega en `modules/`

---

## Tokens y estilos

El único punto de entrada global es `src/styles.css`. La cascada de tokens debe mantenerse en este orden:

1. `src/styles/tokens/base.css` — aliases estables que no dependen de tema.
2. `src/styles/tokens/figma.css` — variables exportadas desde Figma.
3. `src/styles/tokens/generated/tailwind.tokens.css` — puente para utilidades Tailwind.
4. `src/styles/tokens/themes/index.css` — importa `light.css` y `dark.css`.

Reglas:
- No usar hexadecimales, `rgb()` ni sombras hardcodeadas dentro de `src/app/`.
- En componentes usar tokens `--sys-*` o clases Tailwind conectadas a tokens.
- `light.css` solo debe contener overrides puntuales del modo claro.
- `dark.css` concentra los overrides de modo oscuro y debe respetar contraste WCAG.
- No reintroducir un archivo generado que redefina `--sys-*` fuera de esta cascada.

---

## Variables de entorno (backend)

```env
DATABASE_URL="postgresql://..."       ← Neon PostgreSQL
JWT_SECRET="..."
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu_correo@gmail.com
MAIL_PASS=contraseña_app_gmail
MAIL_FROM="SIAF-RP <...>"
PORT=3000
FRONTEND_URL="http://localhost:4200"
```

---

## Documentación

| Documento | Contenido |
|---|---|
| `docs/reglas-negocio-siaf.md` | Reglas de negocio completas por módulo |
| `docs/propuesta-modelo-sql-siaf.md` | Propuesta SQL original del modelo de datos |
| `docs/guia-implementacion-pantallas-siaf.md` | Reglas de construcción de pantallas Angular |
| `docs/plantilla-prompts-pantallas-siaf.md` | Plantillas para desarrollar nuevas pantallas |
| `docs/RESTRUCTURACION_REALIZADA.md` | Historial de cambios arquitecturales |
| `backend/README.md` | Guía completa del backend |
