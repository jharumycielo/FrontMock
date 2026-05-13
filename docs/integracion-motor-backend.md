# Plan: Actualización schema — Estados contabilización MEF + trazabilidad Motor

## Contexto

Revisión del documento oficial MEF "Documento_Tecnico_Funcional_Integracion_Motor_Contabilizacion v5.3" confirmó que la arquitectura del sistema es correcta pero el enum `EstadoContabilizacion` y los campos de contabilización en `Solicitud` no coinciden con el estándar oficial.

## Cambios a aplicar

### 1. Actualizar enum `EstadoContabilizacion`

```prisma
enum EstadoContabilizacion {
  no_aplica   // documento sin impacto contable
  registrado  // JSON generado exitosamente, registrado en tabla aprobados
  en_proceso  // enviado al Motor, en cola de validación y creación de asientos
  procesado   // Motor respondió OK — asiento contable creado
  fallido     // Motor no pudo contabilizar — disponible para reprocesar
}
```

### 2. Agregar campos en `Solicitud`

```prisma
// Reemplaza los campos anteriores de contabilización
fechaRegistroCont     DateTime?  // cuando JSON fue generado exitosamente
fechaEnProceso        DateTime?  // cuando entró a la cola del Motor
fechaProceso          DateTime?  // cuando Motor respondió (procesado o fallido)
numeroAsientoContable String?    // llenado cuando procesado = OK
                                 // formato: unidad_ejecutora + año_fiscal + correlativo
```

### Campos que NO se agregan (confirmado)
- `registradoPor` / `enProcesoPor` → siempre SIAF-RP automático, no aplica guardar
- Trazabilidad del flujo documental (elaboradoPor, verificadoPor, etc.) → ya cubierta por `SolicitudEstadoHistorial` que es dinámico y sirve para todos los módulos

## Archivo a modificar

- `backend/prisma/schema.prisma`

## Verificación

1. `npx prisma validate` → schema sin errores
2. `npx prisma migrate dev --name update_estado_contabilizacion_mef`
3. `npm run start` → servidor arranca sin errores

## Contexto

El backend NestJS + Prisma ya está inicializado. A lo largo de una sesión de levantamiento de reglas de negocio se definieron todos los módulos del sistema. El schema original necesita ajustes importantes y se debe generar un documento de trazabilidad con todo lo acordado.

---

## Tarea 1: Actualizar backend/prisma/schema.prisma

### Cambios requeridos

#### 1. Enum EstadoSolicitud — quitar ANULADO, agregar ELIMINADO
```prisma
enum EstadoSolicitud {
  NUEVO
  ELABORADO
  VERIFICADO
  OBSERVADO
  APROBADO
  RECHAZADO
  ELIMINADO
}
```

#### 2. Enum EstadoEntidad — nuevo
```prisma
enum EstadoEntidad {
  activa
  suspendida
  migrada
  archivada
}
```

#### 3. Enum EstadoUnidad — nuevo
```prisma
enum EstadoUnidad {
  activa
  suspendida
  archivada
}
```

#### 4. Enum TipoPlanContable — nuevo
```prisma
enum TipoPlanContable {
  gubernamental_unico
  general_empresarial
  sistema_financiero
}
```

#### 5. EntidadPublica — reemplazar esActiva por estadoEntidad
```prisma
// Quitar:
esActiva Boolean @default(true)

// Agregar:
estadoEntidad      EstadoEntidad @default(activa)
entidadMigracionId String?       @map("entidad_migracion_id")
fechaSuspension    DateTime?     @map("fecha_suspension")
fechaMigracion     DateTime?     @map("fecha_migracion")
fechaArchivado     DateTime?     @map("fecha_archivado")
```

#### 6. UnidadOrganica — reemplazar esActiva por estadoUnidad
```prisma
// Quitar:
esActiva Boolean @default(true)

// Agregar:
estadoUnidad    EstadoUnidad @default(activa)
fechaSuspension DateTime?    @map("fecha_suspension")
fechaArchivado  DateTime?    @map("fecha_archivado")
```

#### 7. PlanContable — agregar tipoPlan y esEditable
```prisma
tipoPlan   TipoPlanContable @map("tipo_plan")
esEditable Boolean          @default(false) @map("es_editable")
```

#### 8. Solicitud — numeroSolicitud nullable
```prisma
// Cambia de:
numeroSolicitud String @unique @map("numero_solicitud") @db.VarChar(30)

// A:
numeroSolicitud String? @unique @map("numero_solicitud") @db.VarChar(30)
```

#### 9. SolicitudCuentaContable — agregar seccionesModificadas
```prisma
seccionesModificadas String[] @map("secciones_modificadas")
// valores: ["atributos", "vigencia"]
```

#### 10. Nueva tabla TipoDocumento
```prisma
model TipoDocumento {
  id               String  @id @default(uuid())
  codigo           String  @unique @db.VarChar(50)
  nombre           String  @db.VarChar(250)
  modulo           String  @db.VarChar(50)
  entidadDestinoId String  @map("entidad_destino_id")
  unidadDestinoId  String  @map("unidad_destino_id")
  rolDestinoId     String  @map("rol_destino_id")
  esActivo         Boolean @default(true) @map("es_activo")

  entidadDestino    EntidadPublica       @relation("TipoDocDestinoEntidad", fields: [entidadDestinoId], references: [id])
  unidadDestino     UnidadOrganica       @relation("TipoDocDestinoUnidad", fields: [unidadDestinoId], references: [id])
  rolDestino        Rol                  @relation(fields: [rolDestinoId], references: [id])
  accionesPermitidas TipoDocumentoAccion[]
  solicitudes       Solicitud[]

  @@map("tipo_documento")
}
```

#### 11. Nueva tabla TipoDocumentoAccion
```prisma
model TipoDocumentoAccion {
  tipoDocumentoId String @map("tipo_documento_id")
  tipoAccion      String @map("tipo_accion") @db.VarChar(50)

  tipoDocumento TipoDocumento @relation(fields: [tipoDocumentoId], references: [id])

  @@id([tipoDocumentoId, tipoAccion])
  @@map("tipo_documento_accion")
}
```

#### 12. Nueva tabla Notificacion
```prisma
model Notificacion {
  id               String    @id @default(uuid())
  usuarioId        String    @map("usuario_id")
  solicitudId      String    @map("solicitud_id")
  tipo             String    @db.VarChar(80)
  titulo           String    @db.VarChar(250)
  mensaje          String
  leida            Boolean   @default(false)
  leidaEn          DateTime? @map("leida_en")
  emailEnviado     Boolean   @default(false) @map("email_enviado")
  emailEnviadoEn   DateTime? @map("email_enviado_en")
  createdAt        DateTime  @default(now()) @map("created_at")

  usuario   Usuario   @relation(fields: [usuarioId], references: [id])
  solicitud Solicitud @relation(fields: [solicitudId], references: [id])

  @@map("notificacion")
}
```

#### 13. Solicitud — agregar relación con TipoDocumento y Notificacion
```prisma
// Agregar campo:
tipoDocumentoId String @map("tipo_documento_id")

// Agregar relaciones:
tipoDocumento  TipoDocumento  @relation(fields: [tipoDocumentoId], references: [id])
notificaciones Notificacion[]
```

#### 14. Usuario — agregar relación con Notificacion
```prisma
notificaciones Notificacion[]
```

#### 15. Índices críticos para bandejas y consultas
```prisma
// En Solicitud
@@index([estado])
@@index([entidadDestinoId, rolDestinoId, estado])
@@index([createdBy])

// En UsuarioEntidadRol
@@index([usuarioId])

// En SolicitudEstadoHistorial
@@index([solicitudId])

// En AuditoriaEvento
@@index([usuarioId, createdAt])
@@index([entidadPublicaId, createdAt])

// En Notificacion
@@index([usuarioId, leida])
```

---

## Tarea 2: Generar docs/reglas-negocio-siaf.md

Archivo a crear en: `C:\Users\KENNEDY\Desktop\APPs con IA\new-siaf-rp\docs\reglas-negocio-siaf.md`

Contenido: documento completo con todos los módulos, reglas y decisiones acordadas en la sesión.

---

## Archivos a modificar

| Archivo | Acción |
|---|---|
| `backend/prisma/schema.prisma` | Aplicar los 15 cambios listados |
| `docs/reglas-negocio-siaf.md` | Crear nuevo documento |

---

## Verificación

1. `npx prisma validate` — schema sin errores
2. `npx prisma generate` — client regenerado
3. Revisar que todos los modelos nuevos tienen `@@map`
4. Revisar que los índices están declarados

---

## Estructura de carpetas del backend

```
backend/
├── prisma/
│   ├── schema.prisma          ← modelo completo
│   └── migrations/            ← generadas por prisma migrate dev
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts  ← wrapper de PrismaClient
│   ├── auth/
│   ├── identity/
│   ├── organization/
│   ├── requests/
│   ├── chart-accounts/
│   ├── documents/
│   └── audit/
├── .env                       ← DATABASE_URL=postgresql://...
└── package.json
```

---

## Paso 1: Inicializar el backend

```bash
mkdir backend && cd backend
npm init -y
npm install @nestjs/core @nestjs/common @nestjs/platform-express reflect-metadata rxjs
npm install @prisma/client
npm install -D prisma @nestjs/cli typescript
npx prisma init --datasource-provider postgresql
```

Esto genera `prisma/schema.prisma` y `.env` con `DATABASE_URL`.

---

## Paso 2: schema.prisma completo

Archivo: `backend/prisma/schema.prisma`

### Generador y datasource

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Enums

```prisma
enum EstadoUsuario {
  activo
  inactivo
  bloqueado
  pendiente_activacion
}

enum TipoEntidad {
  ministerio
  municipalidad
  gobierno_regional
  unidad_ejecutora
  organismo_publico
  empresa_publica
  otra
}

enum AmbitoAcceso {
  sistema
  nacional
  entidad
  unidad
}

enum EstadoSolicitud {
  NUEVO
  ELABORADO
  VERIFICADO
  OBSERVADO
  APROBADO
  RECHAZADO
  ANULADO
}
```

### Seguridad: usuarios y roles

```prisma
model Usuario {
  id                  String    @id @default(uuid())
  dni                 String    @unique @db.VarChar(20)
  nombres             String    @db.VarChar(150)
  apellidos           String    @db.VarChar(150)
  email               String    @unique @db.VarChar(200)
  passwordHash        String    @map("password_hash") @db.VarChar(300)
  estado              EstadoUsuario
  debeCambiarPassword Boolean   @default(true) @map("debe_cambiar_password")
  ultimoAcceso        DateTime? @map("ultimo_acceso")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")
  createdBy           String?   @map("created_by")
  updatedBy           String?   @map("updated_by")

  perfiles            UsuarioEntidadRol[]
  sesiones            UsuarioSesion[]
  invitacionesCreadas UsuarioInvitacion[] @relation("InvitacionCreador")
  cuentasCreadas      CuentaContable[]    @relation("CuentaCreador")
  cuentasActualizadas CuentaContable[]    @relation("CuentaActualizador")
  archivosSubidos     Archivo[]
  solicitudesCreadas  Solicitud[]         @relation("SolicitudCreador")
  eventosAuditoria    AuditoriaEvento[]

  @@map("usuario")
}

model EntidadPublica {
  id              String      @id @default(uuid())
  codigo          String      @unique @db.VarChar(30)
  ruc             String?     @db.VarChar(20)
  nombre          String      @db.VarChar(250)
  tipoEntidad     TipoEntidad @map("tipo_entidad")
  entidadPadreId  String?     @map("entidad_padre_id")
  esActiva        Boolean     @default(true) @map("es_activa")
  createdAt       DateTime    @default(now()) @map("created_at")
  updatedAt       DateTime    @updatedAt @map("updated_at")

  entidadPadre    EntidadPublica?  @relation("JerarquiaEntidad", fields: [entidadPadreId], references: [id])
  subEntidades    EntidadPublica[] @relation("JerarquiaEntidad")
  unidades        UnidadOrganica[]
  perfiles        UsuarioEntidadRol[]
  invitaciones    UsuarioInvitacion[]
  solicitudesCreadas  Solicitud[] @relation("SolicitudCreadora")
  solicitudesDestino  Solicitud[] @relation("SolicitudDestino")
  solicitudesExternas Solicitud[] @relation("SolicitudExterna")
  cuentasEntidad      CuentaContableEntidadEstado[]
  solicCuentasEntidad SolicitudCuentaEntidadEstado[]
  eventosAuditoria    AuditoriaEvento[]

  @@map("entidad_publica")
}

model UnidadOrganica {
  id               String    @id @default(uuid())
  entidadPublicaId String    @map("entidad_publica_id")
  codigo           String    @db.VarChar(30)
  nombre           String    @db.VarChar(250)
  tipoUnidad       String    @map("tipo_unidad") @db.VarChar(50)
  esActiva         Boolean   @default(true) @map("es_activa")
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")

  entidadPublica   EntidadPublica      @relation(fields: [entidadPublicaId], references: [id])
  perfiles         UsuarioEntidadRol[]
  invitaciones     UsuarioInvitacion[]
  solicitudesCreadas   Solicitud[] @relation("SolicitudUnidadCreadora")
  solicitudesDestino   Solicitud[] @relation("SolicitudUnidadDestino")
  eventosAuditoria     AuditoriaEvento[]

  @@unique([entidadPublicaId, codigo])
  @@map("unidad_organica")
}

model Rol {
  id          String  @id @default(uuid())
  codigo      String  @unique @db.VarChar(50)
  nombre      String  @db.VarChar(100)
  descripcion String?
  esActivo    Boolean @default(true) @map("es_activo")

  permisos    RolPermiso[]
  perfiles    UsuarioEntidadRol[]
  invitaciones UsuarioInvitacion[]
  solicitudesDestino Solicitud[]

  @@map("rol")
}

model Permiso {
  id          String  @id @default(uuid())
  codigo      String  @unique @db.VarChar(100)
  descripcion String?

  roles    RolPermiso[]
  modulos  ModuloPermiso[]

  @@map("permiso")
}

model RolPermiso {
  rolId      String @map("rol_id")
  permisoId  String @map("permiso_id")

  rol     Rol     @relation(fields: [rolId], references: [id])
  permiso Permiso @relation(fields: [permisoId], references: [id])

  @@id([rolId, permisoId])
  @@map("rol_permiso")
}

model UsuarioEntidadRol {
  id               String       @id @default(uuid())
  usuarioId        String       @map("usuario_id")
  entidadPublicaId String       @map("entidad_publica_id")
  unidadOrganicaId String?      @map("unidad_organica_id")
  rolId            String       @map("rol_id")
  ambito           AmbitoAcceso
  esPrincipal      Boolean      @default(false) @map("es_principal")
  esActivo         Boolean      @default(true) @map("es_activo")
  fechaInicio      DateTime     @map("fecha_inicio") @db.Date
  fechaFin         DateTime?    @map("fecha_fin") @db.Date
  createdAt        DateTime     @default(now()) @map("created_at")
  createdBy        String?      @map("created_by")

  usuario        Usuario        @relation(fields: [usuarioId], references: [id])
  entidadPublica EntidadPublica @relation(fields: [entidadPublicaId], references: [id])
  unidadOrganica UnidadOrganica? @relation(fields: [unidadOrganicaId], references: [id])
  rol            Rol            @relation(fields: [rolId], references: [id])

  sesiones             UsuarioSesion[]
  solicitudesCreadas   Solicitud[]     @relation("SolicitudPerfilCreador")
  historialSolicitudes SolicitudEstadoHistorial[]
  eventosAuditoria     AuditoriaEvento[]

  @@map("usuario_entidad_rol")
}
```

### Módulos y permisos

```prisma
model Modulo {
  id            String  @id @default(uuid())
  codigo        String  @unique @db.VarChar(100)
  nombre        String  @db.VarChar(150)
  ruta          String? @db.VarChar(250)
  icono         String? @db.VarChar(100)
  orden         Int     @default(0)
  moduloPadreId String? @map("modulo_padre_id")
  esActivo      Boolean @default(true) @map("es_activo")

  moduloPadre  Modulo?  @relation("JerarquiaModulo", fields: [moduloPadreId], references: [id])
  subModulos   Modulo[] @relation("JerarquiaModulo")
  permisos     ModuloPermiso[]

  @@map("modulo")
}

model ModuloPermiso {
  moduloId  String @map("modulo_id")
  permisoId String @map("permiso_id")

  modulo  Modulo  @relation(fields: [moduloId], references: [id])
  permiso Permiso @relation(fields: [permisoId], references: [id])

  @@id([moduloId, permisoId])
  @@map("modulo_permiso")
}
```

### Sesiones e invitaciones

```prisma
model UsuarioSesion {
  id               String    @id @default(uuid())
  usuarioId        String    @map("usuario_id")
  perfilActivoId   String?   @map("perfil_activo_id")
  refreshTokenHash String    @map("refresh_token_hash") @db.VarChar(300)
  ip               String?   @db.VarChar(80)
  userAgent        String?   @map("user_agent")
  expiraEn         DateTime  @map("expira_en")
  revocadaEn       DateTime? @map("revocada_en")
  createdAt        DateTime  @default(now()) @map("created_at")

  usuario      Usuario           @relation(fields: [usuarioId], references: [id])
  perfilActivo UsuarioEntidadRol? @relation(fields: [perfilActivoId], references: [id])

  @@map("usuario_sesion")
}

model UsuarioInvitacion {
  id               String    @id @default(uuid())
  email            String    @db.VarChar(200)
  entidadPublicaId String    @map("entidad_publica_id")
  unidadOrganicaId String?   @map("unidad_organica_id")
  rolId            String    @map("rol_id")
  tokenHash        String    @map("token_hash") @db.VarChar(300)
  expiraEn         DateTime  @map("expira_en")
  aceptadaEn       DateTime? @map("aceptada_en")
  usuarioCreadoId  String?   @map("usuario_creado_id")  // ← trazabilidad
  createdBy        String    @map("created_by")
  createdAt        DateTime  @default(now()) @map("created_at")

  entidadPublica EntidadPublica  @relation(fields: [entidadPublicaId], references: [id])
  unidadOrganica UnidadOrganica? @relation(fields: [unidadOrganicaId], references: [id])
  rol            Rol             @relation(fields: [rolId], references: [id])
  creador        Usuario         @relation("InvitacionCreador", fields: [createdBy], references: [id])

  @@map("usuario_invitacion")
}
```

### Plan contable

```prisma
model PlanContable {
  id                   String    @id @default(uuid())
  numeroPlanContable   String    @unique @map("numero_plan_contable") @db.VarChar(30)
  descripcion          String    @db.VarChar(250)
  fecha                DateTime  @db.Date
  vigenciaPlanContable String    @map("vigencia_plan_contable") @db.VarChar(50)
  fechaInicio          DateTime  @map("fecha_inicio_desde") @db.Date
  fechaFin             DateTime? @map("fecha_fin_hasta") @db.Date
  esVigente            Boolean   @default(true) @map("es_vigente")
  esVisible            Boolean   @default(true) @map("es_visible")
  createdAt            DateTime  @default(now()) @map("created_at")
  updatedAt            DateTime  @updatedAt @map("updated_at")

  cuentas CuentaContable[]

  @@map("plan_contable")
}

model CuentaContable {
  id                       String  @id @default(uuid())
  planContableId           String  @map("plan_contable_id")
  parentId                 String? @map("parent_id")
  codigoCompleto           String  @map("codigo_completo") @db.VarChar(80)
  elemento                 String  @db.VarChar(2)
  grupo                    String? @db.VarChar(2)
  cuenta                   String? @db.VarChar(2)
  subcuenta1               String? @map("subcuenta_1") @db.VarChar(2)
  subcuenta2               String? @map("subcuenta_2") @db.VarChar(2)
  subcuenta3               String? @map("subcuenta_3") @db.VarChar(2)
  nivel                    Int
  nombre                   String  @db.VarChar(250)
  codigoAnterior           String? @map("codigo_anterior") @db.VarChar(80)
  esImputable              Boolean @map("es_imputable")
  naturaleza               String  @db.VarChar(50)
  tipoElemento             String  @map("tipo_elemento") @db.VarChar(50)
  esMonetaria              Boolean @map("es_monetaria")
  aplicaExtraPresupuestaria Boolean @default(false) @map("aplica_extra_presupuestaria")
  esRecíproca              Boolean @default(false) @map("es_reciproca")
  acActivo                 String? @map("ac_activo") @db.VarChar(20)
  pcPasivo                 String? @map("pc_pasivo") @db.VarChar(20)
  ancActivo                String? @map("anc_activo") @db.VarChar(20)
  pncPasivo                String? @map("pnc_pasivo") @db.VarChar(20)
  tieneDinamicaContable    Boolean @default(false) @map("tiene_dinamica_contable")
  dinamicaDebita           String?  @map("dinamica_debita")
  dinamicaAcredita         String?  @map("dinamica_acredita")
  dinamicaObjeto           String?  @map("dinamica_objeto")
  dinamicaSaldos           String?  @map("dinamica_saldos")
  esParaEntidadEstado      Boolean @default(false) @map("es_para_entidad_estado")
  esVigente                Boolean @default(true) @map("es_vigente")
  esVisible                Boolean @default(true) @map("es_visible")
  createdAt                DateTime @default(now()) @map("created_at")
  updatedAt                DateTime @updatedAt @map("updated_at")
  createdBy                String?  @map("created_by")
  updatedBy                String?  @map("updated_by")

  planContable  PlanContable    @relation(fields: [planContableId], references: [id])
  parent        CuentaContable?  @relation("JerarquiaCuenta", fields: [parentId], references: [id])
  hijos         CuentaContable[] @relation("JerarquiaCuenta")
  creador       Usuario?         @relation("CuentaCreador", fields: [createdBy], references: [id])
  actualizador  Usuario?         @relation("CuentaActualizador", fields: [updatedBy], references: [id])
  ambitos       CuentaContableAmbito[]
  entidades     CuentaContableEntidadEstado[]
  solicitudes   SolicitudCuentaContable[] @relation("CuentaOrigen")

  @@unique([planContableId, codigoCompleto])
  @@map("cuenta_contable")
}

model AmbitoInstitucional {
  id          String  @id @default(uuid())
  codigo      String  @unique @db.VarChar(30)
  descripcion String  @db.VarChar(250)
  esActivo    Boolean @default(true) @map("es_activo")

  cuentas   CuentaContableAmbito[]
  solicitudes SolicitudCuentaAmbito[]

  @@map("ambito_institucional")
}

model CuentaContableAmbito {
  cuentaContableId      String @map("cuenta_contable_id")
  ambitoInstitucionalId String @map("ambito_institucional_id")

  cuentaContable      CuentaContable      @relation(fields: [cuentaContableId], references: [id])
  ambitoInstitucional AmbitoInstitucional @relation(fields: [ambitoInstitucionalId], references: [id])

  @@id([cuentaContableId, ambitoInstitucionalId])
  @@map("cuenta_contable_ambito")
}

model CuentaContableEntidadEstado {
  cuentaContableId String @map("cuenta_contable_id")
  entidadPublicaId String @map("entidad_publica_id")

  cuentaContable CuentaContable @relation(fields: [cuentaContableId], references: [id])
  entidadPublica EntidadPublica @relation(fields: [entidadPublicaId], references: [id])

  @@id([cuentaContableId, entidadPublicaId])
  @@map("cuenta_contable_entidad_estado")
}
```

### Solicitudes

```prisma
model Solicitud {
  id                    String          @id @default(uuid())
  numeroSolicitud       String          @unique @map("numero_solicitud") @db.VarChar(30)
  tipoSolicitud         String          @map("tipo_solicitud") @db.VarChar(80)
  tipoAccion            String          @map("tipo_accion") @db.VarChar(50)
  fechaRequerimiento    DateTime        @map("fecha_requerimiento")  // timestamp unificado
  organoLinea           String          @map("organo_linea") @db.VarChar(250)
  entidadCreadoraId     String          @map("entidad_creadora_id")
  unidadCreadoraId      String?         @map("unidad_creadora_id")
  perfilCreadorId       String          @map("perfil_creador_id")
  entidadDestinoId      String?         @map("entidad_destino_id")
  unidadDestinoId       String?         @map("unidad_destino_id")
  rolDestinoId          String?         @map("rol_destino_id")
  estado                EstadoSolicitud
  justificacion         String
  provieneEntidadExterna Boolean        @default(false) @map("proviene_entidad_externa")
  entidadExternaId      String?         @map("entidad_externa_id")
  createdAt             DateTime        @default(now()) @map("created_at")
  updatedAt             DateTime        @updatedAt @map("updated_at")
  createdBy             String          @map("created_by")
  updatedBy             String?         @map("updated_by")

  entidadCreadora  EntidadPublica     @relation("SolicitudCreadora", fields: [entidadCreadoraId], references: [id])
  unidadCreadora   UnidadOrganica?    @relation("SolicitudUnidadCreadora", fields: [unidadCreadoraId], references: [id])
  perfilCreador    UsuarioEntidadRol  @relation("SolicitudPerfilCreador", fields: [perfilCreadorId], references: [id])
  entidadDestino   EntidadPublica?    @relation("SolicitudDestino", fields: [entidadDestinoId], references: [id])
  unidadDestino    UnidadOrganica?    @relation("SolicitudUnidadDestino", fields: [unidadDestinoId], references: [id])
  rolDestino       Rol?               @relation(fields: [rolDestinoId], references: [id])
  entidadExterna   EntidadPublica?    @relation("SolicitudExterna", fields: [entidadExternaId], references: [id])
  creador          Usuario            @relation("SolicitudCreador", fields: [createdBy], references: [id])

  cuentas          SolicitudCuentaContable[]
  sustentos        SolicitudSustento[]
  historialEstados SolicitudEstadoHistorial[]

  @@map("solicitud")
}

model SolicitudCuentaContable {
  id                    String  @id @default(uuid())
  solicitudId           String  @map("solicitud_id")
  planContableId        String  @map("plan_contable_id")
  cuentaContableOrigenId String? @map("cuenta_contable_origen_id")
  // ← snapshot de campos idénticos a CuentaContable
  codigoCompleto        String  @map("codigo_completo") @db.VarChar(80)
  elemento              String  @db.VarChar(2)
  grupo                 String? @db.VarChar(2)
  cuenta                String? @db.VarChar(2)
  subcuenta1            String? @map("subcuenta_1") @db.VarChar(2)
  subcuenta2            String? @map("subcuenta_2") @db.VarChar(2)
  subcuenta3            String? @map("subcuenta_3") @db.VarChar(2)
  nivel                 Int
  nombre                String  @db.VarChar(250)
  esImputable           Boolean @map("es_imputable")
  naturaleza            String  @db.VarChar(50)
  tipoElemento          String  @map("tipo_elemento") @db.VarChar(50)
  esMonetaria           Boolean @map("es_monetaria")
  tieneDinamicaContable Boolean @default(false) @map("tiene_dinamica_contable")
  dinamicaDebita        String? @map("dinamica_debita")
  dinamicaAcredita      String? @map("dinamica_acredita")
  esVigente             Boolean @default(true) @map("es_vigente")
  createdAt             DateTime @default(now()) @map("created_at")
  updatedAt             DateTime @updatedAt @map("updated_at")

  solicitud          Solicitud       @relation(fields: [solicitudId], references: [id])
  cuentaOrigen       CuentaContable? @relation("CuentaOrigen", fields: [cuentaContableOrigenId], references: [id])
  ambitos            SolicitudCuentaAmbito[]
  entidades          SolicitudCuentaEntidadEstado[]

  @@map("solicitud_cuenta_contable")
}

model SolicitudCuentaAmbito {
  solicitudCuentaContableId String @map("solicitud_cuenta_contable_id")
  ambitoInstitucionalId     String @map("ambito_institucional_id")

  solicitudCuenta     SolicitudCuentaContable @relation(fields: [solicitudCuentaContableId], references: [id])
  ambitoInstitucional AmbitoInstitucional     @relation(fields: [ambitoInstitucionalId], references: [id])

  @@id([solicitudCuentaContableId, ambitoInstitucionalId])
  @@map("solicitud_cuenta_ambito")
}

model SolicitudCuentaEntidadEstado {
  solicitudCuentaContableId String @map("solicitud_cuenta_contable_id")
  entidadPublicaId          String @map("entidad_publica_id")

  solicitudCuenta SolicitudCuentaContable @relation(fields: [solicitudCuentaContableId], references: [id])
  entidadPublica  EntidadPublica          @relation(fields: [entidadPublicaId], references: [id])

  @@id([solicitudCuentaContableId, entidadPublicaId])
  @@map("solicitud_cuenta_entidad_estado")
}

model Archivo {
  id             String   @id @default(uuid())
  nombreOriginal String   @map("nombre_original") @db.VarChar(250)
  nombreStorage  String   @map("nombre_storage") @db.VarChar(250)
  extension      String   @db.VarChar(20)
  mimeType       String   @map("mime_type") @db.VarChar(100)
  sizeBytes      BigInt   @map("size_bytes")
  storagePath    String   @map("storage_path") @db.VarChar(500)
  createdAt      DateTime @default(now()) @map("created_at")
  createdBy      String   @map("created_by")

  creador   Usuario             @relation(fields: [createdBy], references: [id])
  sustentos SolicitudSustento[]

  @@map("archivo")
}

model SolicitudSustento {
  id           String   @id @default(uuid())
  solicitudId  String   @map("solicitud_id")
  archivoId    String   @map("archivo_id")
  tipoSustento String   @map("tipo_sustento") @db.VarChar(80)
  createdAt    DateTime @default(now()) @map("created_at")

  solicitud Solicitud @relation(fields: [solicitudId], references: [id])
  archivo   Archivo   @relation(fields: [archivoId], references: [id])

  @@map("solicitud_sustento")
}

model SolicitudEstadoHistorial {
  id             String          @id @default(uuid())
  solicitudId    String          @map("solicitud_id")
  estadoAnterior EstadoSolicitud? @map("estado_anterior")
  estadoNuevo    EstadoSolicitud @map("estado_nuevo")
  comentario     String?
  createdAt      DateTime        @default(now()) @map("created_at")
  createdBy      String          @map("created_by")
  perfilId       String?         @map("perfil_id")

  solicitud Solicitud          @relation(fields: [solicitudId], references: [id])
  creador   Usuario            @relation(fields: [createdBy], references: [id])
  perfil    UsuarioEntidadRol? @relation(fields: [perfilId], references: [id])

  @@map("solicitud_estado_historial")
}
```

### Auditoría

```prisma
model AuditoriaEvento {
  id               String   @id @default(uuid())
  usuarioId        String   @map("usuario_id")
  perfilId         String?  @map("perfil_id")
  entidadPublicaId String?  @map("entidad_publica_id")
  unidadOrganicaId String?  @map("unidad_organica_id")
  accion           String   @db.VarChar(120)
  tablaAfectada    String?  @map("tabla_afectada") @db.VarChar(120)
  registroId       String?  @map("registro_id")
  valorAnterior    Json?    @map("valor_anterior")
  valorNuevo       Json?    @map("valor_nuevo")
  ip               String?  @db.VarChar(80)
  userAgent        String?  @map("user_agent")
  createdAt        DateTime @default(now()) @map("created_at")

  usuario        Usuario            @relation(fields: [usuarioId], references: [id])
  perfil         UsuarioEntidadRol? @relation(fields: [perfilId], references: [id])
  entidadPublica EntidadPublica?    @relation(fields: [entidadPublicaId], references: [id])
  unidadOrganica UnidadOrganica?    @relation(fields: [unidadOrganicaId], references: [id])

  @@map("auditoria_evento")
}
```

---

## Paso 3: PrismaService en NestJS

Archivo: `backend/src/prisma/prisma.service.ts`

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

Archivo: `backend/src/prisma/prisma.module.ts`

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

---

## Paso 4: Generar migración y aplicar

```bash
# Generar la primera migración
npx prisma migrate dev --name init

# Ver la base de datos en Prisma Studio
npx prisma studio

# Generar el client después de cambios en schema
npx prisma generate
```

---

## Paso 5: Uso típico en un servicio NestJS

```typescript
// src/requests/requests.service.ts
@Injectable()
export class RequestsService {
  constructor(private readonly prisma: PrismaService) {}

  // Bandeja del aprobador
  async getBandejaAprobador(perfilId: string) {
    const perfil = await this.prisma.usuarioEntidadRol.findUnique({
      where: { id: perfilId },
    });

    return this.prisma.solicitud.findMany({
      where: {
        entidadDestinoId: perfil.entidadPublicaId,
        unidadDestinoId: perfil.unidadOrganicaId,
        rolDestinoId: perfil.rolId,
        estado: { in: ['VERIFICADO', 'OBSERVADO'] },
      },
      include: {
        entidadCreadora: true,
        cuentas: true,
        historialEstados: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
  }
}
```

---

## Archivos críticos a crear

| Archivo | Acción |
|---|---|
| `backend/prisma/schema.prisma` | Crear con el schema completo |
| `backend/.env` | Crear con `DATABASE_URL` |
| `backend/src/prisma/prisma.service.ts` | Crear |
| `backend/src/prisma/prisma.module.ts` | Crear |
| `backend/src/app.module.ts` | Importar `PrismaModule` |
| `backend/package.json` | Inicializar con deps NestJS + Prisma |

---

## Verificación

1. `npx prisma validate` — valida el schema sin errores de sintaxis
2. `npx prisma migrate dev --name init` — crea las tablas en PostgreSQL
3. `npx prisma studio` — inspección visual del modelo
4. Test de consulta de bandeja: crear una solicitud de prueba y recuperarla con los filtros de perfil

---

## Decisiones importantes tomadas

- **`fecha_requerimiento` como `DateTime`** en lugar de fecha + hora separadas (más limpio)
- **`usuario_creado_id` en `UsuarioInvitacion`** para trazabilidad (mejora sobre la propuesta original)
- **`@@map`** en cada modelo para mantener los nombres en snake_case en PostgreSQL y camelCase en TypeScript
- **Enums de Prisma** para `EstadoUsuario`, `TipoEntidad`, `AmbitoAcceso`, `EstadoSolicitud` en lugar de varchar libre
- **`SolicitudCuentaContable` como snapshot** intencional — los campos se copian al momento de crear la solicitud para preservar el historial aunque la cuenta oficial cambie
