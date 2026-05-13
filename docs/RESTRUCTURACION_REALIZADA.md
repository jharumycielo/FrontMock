# Historial de cambios arquitecturales — SIAF-RP

Registro cronológico de todas las reestructuraciones y mejoras aplicadas al proyecto.

---

## [2026-05-13] Arquitectura escalable de procesos y documentos

### Problema
El sistema solo tenía `TipoDocumento` con un campo `modulo` libre. No había jerarquía de catálogos, clasificadores y procesos. No había mecanismo para generación automática de documentos entre módulos.

### Solución aplicada

**Nueva tabla `ProcesoSistema`:**
```
módulo → categoría (catalogo | clasificador | proceso) → proceso específico
└── Cada proceso tiene sus propios TipoDocumento
└── Cada TipoDocumento tiene sus TipoDocumentoAccion
```

**Nueva tabla `ReglaGeneracionAutomatica`:**
- Define qué documentos se crean automáticamente al aprobar otro
- Soporta generación entre módulos distintos (ej. Tesorería → Contabilidad)
- Administrada solo por OGTI

**Campos nuevos en `Solicitud`:**
- `catId` — clasificador/catálogo relacionado (pendiente definición)
- `estadoContabilizacion` — estado del proceso de contabilización automática
- `fechaContabilizacion` — fecha en que se contabilizó
- `esGeneradaAutomaticamente` — flag si fue creada por una regla automática
- `solicitudOrigenId` — referencia al documento que la originó

**Enums nuevos:**
- `CategoriaProcesoSistema` = catalogo | clasificador | proceso
- `EstadoContabilizacion` = no_aplica | pendiente | en_proceso | contabilizado | error

### Seed actualizado
- 3 procesos del sistema contable: plan-cuentas-contables, eventos-contables, registro-asiento-ajuste
- TipoDocumento ahora tiene `procesoId` conectado a `ProcesoSistema`
- Nuevo tipo de documento: SRAA (Solicitud de Registro de Asiento de Ajuste)

---

## [2026-05-12] OTP por WhatsApp con Baileys

### Implementado
- Campo `telefono` agregado a la tabla `usuario` (migración aplicada)
- Módulo `whatsapp/` en el backend con `WhatsappService`
- Script `init-whatsapp.ts` para escanear el QR y guardar sesión una sola vez
- Sesión persistente en `backend/whatsapp_session/` (reconexión automática)
- Nuevo endpoint `POST /auth/reenviar-otp-whatsapp`

### Flujo
```
Email (siempre) + WhatsApp (si no tiene acceso al correo)
→ Mismo código OTP enviado por ambos canales
→ El usuario elige el canal en la pantalla OTP del frontend
```

### Proveedor
- **Baileys (@whiskeysockets/baileys)** — sin API oficial de Meta, usa sesión de WhatsApp personal
- Formato de teléfono: `+51987654321` (Perú por defecto)

---

## [2026-05-12] Normalización de CSS y tokens

### Problema
Había varias hojas globales redefiniendo los mismos tokens `--sys-*`. Esto generaba conflictos de cascada entre valores exportados desde Figma, tokens generados, overrides de light y overrides de dark.

### Solución aplicada
Se dejó una sola ruta de carga para estilos globales:

```
src/styles.css
├── styles/tokens/index.css              ← importa base.css
├── styles/tokens/figma.css              ← tokens exportados desde Figma
├── styles/tokens/generated/tailwind.tokens.css
└── styles/tokens/themes/index.css       ← importa light.css y dark.css
```

### Reglas vigentes
- `base.css` contiene aliases estables que no dependen de tema.
- `figma.css` contiene los tokens exportados desde Figma.
- `light.css` contiene solo overrides puntuales del modo claro.
- `dark.css` contiene los overrides del modo oscuro.
- `generated/tokens.css` fue retirado de la cascada para evitar duplicidad de `--sys-*`.
- `figma-tokens.css` fue movido a `styles/tokens/figma.css`.

---

## [2026-05-12] Migración a estructura modular escalable

### Problema
La carpeta `features/` crecía de forma plana mezclando procesos de distintos módulos del sistema (contabilidad, asiento de ajuste, escritorio virtual). Al agregar nuevos módulos (presupuesto, tesorería, abastecimiento) la estructura se volvería inmanejable.

### Solución aplicada
Reorganización a estructura de módulos por dominio:

```
ANTES:
features/
├── chart-accounts/
├── adjustment-seat/
├── virtual-desk/
├── process-configs/
├── login/
├── otp-verification/
└── showcase/

DESPUÉS:
modules/
├── contabilidad/
│   ├── plan-cuentas/        ← era chart-accounts
│   ├── asiento-ajuste/      ← era adjustment-seat
│   └── config/              ← era process-configs
└── admin/
    ├── usuarios/
    ├── entidades/
    ├── unidades/
    └── auditoria/

layout/
└── virtual-desk/            ← movido desde features

features/                    ← solo páginas públicas
├── login/
├── otp-verification/
└── showcase/
```

### Archivos nuevos creados
- `core/config/procesos.config.ts` — catálogo central de módulos y procesos
- `layout/virtual-desk/` — portal central compartido por todos los módulos
- `layout/admin-menu/` — panel de navegación de administración
- `modules/admin/` — pantallas de gestión (usuarios, entidades, auditoría)

### Impacto en rutas
Las URLs no cambiaron. Solo cambió la ubicación del código.

---

## [2026-05-11] Backend NestJS + Prisma + PostgreSQL

### Implementado
- Inicialización del proyecto backend NestJS en `backend/`
- Schema Prisma completo con 25+ tablas
- Migración inicial aplicada en Neon (PostgreSQL 15)
- Seed inicial con roles, permisos, entidades y usuario admin

### Módulos del backend creados
| Módulo | Endpoints principales |
|---|---|
| Auth | login, logout, refresh, OTP, cambiar password/perfil |
| Identity | CRUD usuarios, perfiles, invitaciones |
| Organization | CRUD entidades, unidades, estados |
| Requests | solicitudes, bandejas, flujo de estados |
| ChartAccounts | planes, cuentas, catálogos |
| Documents | upload PDF a Cloudinary |
| Notifications | email Gmail + almacenamiento en BD |

### Flujo de solicitud probado end-to-end
```
NUEVO → ELABORADO → VERIFICADO → APROBADO → cuenta creada en plan oficial
```

---

## [2026-05-09] Modelo de datos SQL + Prisma schema

### Implementado
- Levantamiento completo de reglas de negocio por módulo (8 módulos)
- Schema Prisma con enums, relaciones, índices y campos de auditoría
- Decisiones clave documentadas en `docs/reglas-negocio-siaf.md`

### Tablas del schema
- `usuario`, `usuario_entidad_rol`, `usuario_sesion`, `usuario_invitacion`
- `entidad_publica`, `unidad_organica`
- `rol`, `permiso`, `rol_permiso`, `modulo`, `modulo_permiso`
- `plan_contable`, `cuenta_contable`, `ambito_institucional`
- `solicitud`, `solicitud_cuenta_contable`, `solicitud_estado_historial`
- `solicitud_sustento`, `archivo`
- `tipo_documento`, `tipo_documento_accion`
- `notificacion`, `auditoria_evento`, `otp_verificacion`

---

## [2026-05-04] Reestructuración inicial del frontend Angular

### Problema original
El proyecto tenía una estructura plana sin separación clara entre UI pura, componentes de negocio y páginas.

### Solución aplicada
Separación en capas con responsabilidades claras:

| Capa | Responsabilidad |
|---|---|
| `shared/ui/` | UI Kit puro, sin lógica SIAF (45+ componentes) |
| `shared/components/` | Componentes transversales con lógica de negocio |
| `layout/` | Shell exclusivo del sistema |
| `modules/` | Features por dominio de negocio |
| `features/` | Solo páginas públicas (login, otp, showcase) |

### Reglas establecidas
- `shared/ui/` nunca importa desde capas superiores
- Los módulos no se importan entre sí
- Si algo se necesita en dos módulos → sube a `shared/components/`
- Standalone components en todos los componentes nuevos
- Lazy loading por módulo vía `loadChildren`
- Estado con Angular Signals (`signal`, `computed`)
