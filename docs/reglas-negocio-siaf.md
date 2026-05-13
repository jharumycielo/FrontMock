# Reglas de negocio SIAF-RP — Módulo de Gestión Contable

Este documento consolida todas las reglas de negocio, decisiones de diseño y acuerdos tomados durante el levantamiento de requerimientos. Sirve como referencia para el desarrollo, auditorías de código y futuras modificaciones.

---

## Índice

1. [Auth y Login](#1-auth-y-login)
2. [Usuarios](#2-usuarios)
3. [Entidades Públicas y Unidades Orgánicas](#3-entidades-públicas-y-unidades-orgánicas)
4. [Catálogo de Tipos de Documento](#4-catálogo-de-tipos-de-documento)
5. [Solicitudes (Documentos)](#5-solicitudes-documentos)
6. [Cuentas Contables (Registros)](#6-cuentas-contables-registros)
7. [Archivos y Carga Masiva](#7-archivos-y-carga-masiva)
8. [Notificaciones](#8-notificaciones)
9. [Auditoría](#9-auditoría)
10. [Secciones del Sistema](#10-secciones-del-sistema)
11. [Pendientes y Trabajo Futuro](#11-pendientes-y-trabajo-futuro)

---

## 1. Auth y Login

### Credenciales
- El login es **únicamente con DNI + password**
- El email no se usa para login, solo para notificaciones

### Flujo de login
1. Buscar usuario por DNI
2. Verificar estado: solo `activo` puede entrar
   - `bloqueado` → 403
   - `inactivo` → 403
   - `pendiente_activacion` → 403
3. Verificar password con bcrypt
4. Cargar perfiles activos (`esActivo = true`, `fechaFin IS NULL o >= hoy`)
5. Seleccionar perfil activo: el que tenga `esPrincipal = true`, si no existe, el primero disponible
6. Crear sesión en `UsuarioSesion`
7. Actualizar `ultimoAcceso`
8. Si `debeCambiarPassword = true` → responder con flag, el frontend redirige a cambio de password

### Respuesta del login
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "debeCambiarPassword": false,
  "perfilActivo": { "id", "entidad", "unidad", "rol", "ambito" },
  "perfilesDisponibles": [...]
}
```

### Cambio de perfil
- Sin cerrar sesión — solo cambia `perfilActivoId` en `UsuarioSesion`

### Endpoints de auth
| Endpoint | Descripción |
|---|---|
| `POST /auth/login` | DNI + password → tokens + perfil |
| `POST /auth/logout` | Revoca sesión actual |
| `POST /auth/refresh` | Renueva access token con refresh token |
| `POST /auth/cambiar-password` | Cambio obligatorio en primer acceso |
| `PATCH /auth/cambiar-perfil` | Cambia perfil activo sin cerrar sesión |
| `POST /auth/solicitar-otp` | Genera y envía código de 4 dígitos al email |
| `POST /auth/verificar-otp` | Valida código OTP y actualiza password |
| `POST /auth/reenviar-otp-whatsapp` | Reenvía el mismo código activo por WhatsApp |

### Recuperación de password — Flujo OTP

```
1. Usuario ingresa su email en la pantalla de recuperación
   → POST /auth/solicitar-otp
   → Código de 4 dígitos enviado al EMAIL
   → Válido por 10 minutos

2. Si no tiene acceso al correo → click en "Prueba de otra manera"
   → POST /auth/reenviar-otp-whatsapp
   → El MISMO código (no uno nuevo) es enviado al WHATSAPP registrado
   → Requiere que el usuario tenga campo telefono registrado

3. Usuario ingresa el código recibido
   → POST /auth/verificar-otp
   → Password actualizado
   → Todas las sesiones activas revocadas
   → Debe hacer login nuevamente
```

### Reglas OTP
- El código tiene exactamente **4 dígitos**
- Expira en **10 minutos**
- Solo el código más reciente es válido (los anteriores se invalidan)
- El reenvío por WhatsApp usa el mismo código generado, no uno nuevo
- Si no hay código vigente al pedir WhatsApp → error 400
- Si el usuario no tiene teléfono registrado → error 400

### WhatsApp — configuración técnica
- Proveedor: **Baileys (@whiskeysockets/baileys)** — sin API oficial de Meta
- Sesión guardada en: `backend/whatsapp_session/`
- Formato del teléfono: `+51987654321` (código país + número sin 0 inicial)
- País principal: **Perú (+51)**
- Re-escanear QR si la sesión expira: `npm run whatsapp:init`

### Seguridad
- Nunca revelar si el DNI/email/teléfono existe: responder igual siempre
- Los refresh tokens se almacenan como hash (bcrypt)
- Las sesiones revocadas no pueden generar nuevos tokens
- El código OTP se invalida inmediatamente después de ser usado

---

## 2. Usuarios

### ¿Quién puede crear usuarios?

| Rol | Puede crear en |
|---|---|
| `ADMIN_SISTEMA` (OGTI) | Cualquier entidad, incluyendo otros ADMIN_ENTIDAD |
| `ADMIN_ENTIDAD` | Solo dentro de su propia entidad |

### Formas de crear usuario
1. **Directa**: admin llena todos los datos → sistema genera password temporal → `debeCambiarPassword = true`
2. **Por invitación**: admin ingresa email + entidad + unidad + rol → se envía enlace al email → usuario define su password al aceptar

### Datos requeridos al crear
- DNI, nombres, apellidos, email
- Entidad, unidad orgánica, rol (asignado al momento de crear)
- El usuario puede tener más de un perfil desde el inicio
- Solo un perfil puede ser `esPrincipal = true`

### Activar / Desactivar / Bloquear

| Acción | Quién puede | Resultado |
|---|---|---|
| Desactivar | ADMIN_SISTEMA, ADMIN_ENTIDAD (solo su entidad) | `estado = inactivo` |
| Bloquear | ADMIN_SISTEMA, ADMIN_ENTIDAD (solo su entidad) | `estado = bloqueado` |
| Reactivar | ADMIN_SISTEMA, ADMIN_ENTIDAD (solo su entidad) | `estado = activo` |

### Visibilidad de la lista de usuarios
- `ADMIN_SISTEMA` → ve usuarios de todas las entidades
- `ADMIN_ENTIDAD` → ve **solo** los usuarios de su entidad (sin acceso en lectura a otras)

---

## 3. Entidades Públicas y Unidades Orgánicas

### ¿Quién gestiona qué?

| Acción | ADMIN_SISTEMA (OGTI) | ADMIN_ENTIDAD |
|---|---|---|
| Crear entidad pública | ✅ | ❌ |
| Editar entidad pública | ✅ | ❌ |
| Crear unidad orgánica | ✅ | ✅ (solo su entidad) |
| Editar unidad orgánica | ✅ | ✅ (solo su entidad) |
| Suspender / Archivar / Migrar | ✅ | ❌ |

### Jerarquía de entidades
- Las entidades tienen jerarquía vía `entidadPadreId`
- Ejemplo: Ministerio → Unidad Ejecutora → Oficina

### Estados de una entidad

| Estado | Descripción | ¿Reversible? |
|---|---|---|
| `activa` | Operando normalmente | — |
| `suspendida` | Congelada temporalmente | ✅ Se puede reactivar |
| `migrada` | Absorbida por otra entidad | ❌ Definitivo |
| `archivada` | Cierre definitivo, solo lectura | ❌ Definitivo |

#### Al suspender
- `estadoEntidad = suspendida`
- Usuarios → `estado = inactivo` temporalmente
- Solicitudes en `NUEVO`, `ELABORADO`, `VERIFICADO` → se pausan
- Solicitudes en estado final (`APROBADO`, `RECHAZADO`, `ELIMINADO`) → sin cambio
- Al reactivar → usuarios vuelven a `activo`, solicitudes pausadas retoman su estado

#### Al migrar (absorbida por otra entidad)
- `estadoEntidad = migrada`, `entidadMigracionId = id de entidad destino`
- Usuarios → quedan inactivos en entidad origen
- El admin de la entidad destino los **reasigna manualmente** con el rol que corresponda
- Solicitudes e historial → quedan **archivados en modo solo lectura**
- No se puede reactivar

#### Al archivar
- `estadoEntidad = archivada`
- Todo queda en modo solo lectura
- Usuarios → `estado = inactivo` definitivamente
- No se puede reactivar ni migrar después

### Estados de una unidad orgánica

| Estado | Descripción | ¿Reversible? |
|---|---|---|
| `activa` | Operando normalmente | — |
| `suspendida` | Congelada temporalmente | ✅ |
| `archivada` | Cierre definitivo | ❌ |

> Las unidades **no tienen migración** — solo suspensión y archivo.

---

## 4. Catálogo de Tipos de Documento

### ¿Quién lo administra?
- **Solo OGTI (ADMIN_SISTEMA)** puede crear, editar y desactivar tipos de documento

### Concepto
El tipo de documento define el proceso completo:
- Nombre del documento (ej. "Solicitud de Cuentas Contables")
- Módulo al que pertenece (`contabilidad`, `tesoreria`, `presupuesto`, etc.)
- Destino fijo: entidad + unidad + rol que debe atenderlo
- Acciones permitidas: `creacion`, `modificacion`, `reversion`, etc.

### Ejemplos del módulo contable

| Documento | Acciones permitidas | Destino |
|---|---|---|
| Solicitud de Cuentas Contables | creacion, modificacion | DGCP / MEF |
| Solicitud de carga masiva de plan de cuentas | creacion | DGCP / MEF |

### Regla importante
- El CREADOR **no elige el destino** — viene fijo del tipo de documento
- Al crear una solicitud, el sistema asigna automáticamente `entidadDestinoId`, `unidadDestinoId` y `rolDestinoId` desde el tipo de documento

### Módulos futuros
- Cada módulo (tesorería, presupuesto, abastecimiento) tendrá sus propios tipos de documento
- En contabilidad automática, procesos de otros módulos generarán documentos contables automáticamente

---

## 5. Solicitudes (Documentos)

### ¿Quién puede crear?
- Cualquier usuario con rol `CREADOR` — sin restricción adicional por entidad o unidad

### Tipos de acción

| Tipo | Descripción |
|---|---|
| `creacion` | Propone una cuenta nueva |
| `modificacion` | Modifica una cuenta existente (atributos o vigencia) |
| `reversion` | Revierte un cambio contable anterior |
| `anulacion` | Anula una solicitud *(pendiente — para versión futura)* |

### Numeración automática
- **Formato**: `COD-AÑO-CORRELATIVO` — ejemplo: `923-2025-00001`
  - `923` → código de la entidad o unidad creadora
  - `2025` → año actual
  - `00001` → correlativo por año (reinicia cada año)
- **Se genera al pasar a estado `ELABORADO`**, no al crear
- En estado `NUEVO` el `numeroSolicitud` es `null`
- El número **no cambia** durante todo el ciclo de vida

### Cantidad de cuentas propuestas
- Mínimo 1, máximo ilimitado (1 a N según el negocio)

### Regla de archivo de sustento
- Al menos 1 archivo PDF obligatorio para pasar a `ELABORADO`
- Sin archivo → backend rechaza la transición con error 400

### Estados y transiciones

```
NUEVO ──────────────────────────────────────────────────────► (sin número)
  │
  ▼ (genera número, requiere mínimo 1 archivo PDF)
ELABORADO ──────────────────────────────────────────────────► ELIMINADO
  │                                                           (solo CREADOR)
  ▼
VERIFICADO ──(llega a bandeja del APROBADOR)
  │
  ├──► APROBADO   → cuentas se crean/actualizan oficialmente en el plan
  ├──► RECHAZADO  → proceso termina (comentario obligatorio)
  └──► OBSERVADO  → regresa al CREADOR (comentario obligatorio)
         │
         ├──► ELABORADO → VERIFICADO → ...
         └──► ELIMINADO (solo CREADOR)
```

### Reglas por estado

| Transición | Quién puede | Condiciones |
|---|---|---|
| NUEVO → ELABORADO | CREADOR | Mínimo 1 archivo adjunto |
| ELABORADO → VERIFICADO | CREADOR | — |
| ELABORADO → ELIMINADO | CREADOR | — |
| VERIFICADO → APROBADO | APROBADOR | — |
| VERIFICADO → RECHAZADO | APROBADOR | Comentario obligatorio |
| VERIFICADO → OBSERVADO | APROBADOR | Comentario obligatorio |
| OBSERVADO → ELABORADO | CREADOR | — |
| OBSERVADO → ELIMINADO | CREADOR | — |

> `ELIMINADO` es un **estado final** — no borra el registro, preserva el historial

### ¿Qué puede modificar el CREADOR cuando está OBSERVADA?

| Campo | ¿Modificable? |
|---|---|
| Cuentas propuestas | ✅ Agregar, editar, eliminar |
| Archivos de sustento | ✅ Agregar, reemplazar, quitar |
| `justificacion` | ✅ |
| `organoLinea` | ✅ |
| `fechaRequerimiento` | ✅ |
| `tipoDocumentoId` | ❌ Fijo al proceso |
| `tipoAccion` | ❌ Fijo al proceso |
| `entidadDestinoId` | ❌ Fijo al tipo de documento |
| `unidadDestinoId` | ❌ Fijo al tipo de documento |
| `rolDestinoId` | ❌ Fijo al tipo de documento |

### Trazabilidad — SolicitudEstadoHistorial
Cada cambio de estado genera un registro con:
- Quién hizo el cambio (usuario + perfil)
- De qué estado a qué estado
- Comentario (obligatorio en OBSERVADO y RECHAZADO)
- Timestamp

---

## 6. Cuentas Contables (Registros)

### Tres tipos de plan contable

| Tipo | Constante | ¿Editable? |
|---|---|---|
| Plan Contable Gubernamental Único | `gubernamental_unico` | ✅ Vía solicitudes |
| Plan Contable General Empresarial | `general_empresarial` | ❌ Solo lectura |
| Manual de Contabilidad para Empresas del Sistema Financiero | `sistema_financiero` | ❌ Solo lectura |

- Solo sobre el PCGU aplica el proceso de solicitudes
- Los otros dos se cargan masivamente y quedan en solo lectura
- La carga masiva de los tres tipos la hace el CREADOR de DGCP vía solicitud normal
- OGTI no interviene en operaciones contables

### Al aprobar una solicitud
- Se crea o actualiza la `CuentaContable` con `esVigente = true` inmediatamente
- Si `esParaEntidadEstado = true` → se copian las entidades de `SolicitudCuentaEntidadEstado` a `CuentaContableEntidadEstado`
- La cuenta aparece en la sección Registros

### esVigente vs esVisible

| Campo | Valor | Significado |
|---|---|---|
| `esVigente` | `true` | Cuenta activa, operable en asientos |
| `esVigente` | `false` | Cuenta inactiva, no operable |
| `esVisible` | `true` | Aparece en reportes y consultas |
| `esVisible` | `false` | Oculta incluso en reportes (caso extremo) |

### Secciones de modificación (tipoAccion = `modificacion`)

| Sección | Campos incluidos |
|---|---|
| `atributos` | nombre, naturaleza, tipoElemento, esImputable, esMonetaria, aplicaExtraPresupuestaria, esReciproca, tieneDinamicaContable, dinámica contable completa, esParaEntidadEstado, entidades asignadas, ámbitos institucionales |
| `vigencia` | `esVigente`, `esVisible` |

El campo `seccionesModificadas` en `SolicitudCuentaContable` indica qué secciones se están modificando.

### Visibilidad en Registros

| Rol / Entidad | Qué ve |
|---|---|
| CREADOR / APROBADOR de DGCP | Todas las cuentas: activas + inactivas |
| Otras entidades | Cuentas generales (`esParaEntidadEstado = false`) + cuentas asignadas a su entidad |

```
Filtro para otras entidades:
WHERE (es_para_entidad_estado = false)
   OR (es_para_entidad_estado = true
       AND entidad_publica_id = :miEntidad)
```

### Cuentas con esParaEntidadEstado = true
- Al marcar `true` → obligatorio seleccionar mínimo 1 entidad
- Puede asignarse a múltiples entidades simultáneamente
- Backend valida que `entidadIds` no esté vacío cuando `esParaEntidadEstado = true`

---

## 7. Archivos y Carga Masiva

### Archivo de justificación (sustento)

| Parámetro | Valor |
|---|---|
| Formatos permitidos | Solo PDF |
| Tamaño máximo | 10 MB |
| Cantidad por solicitud | 1 a N |
| Validación MIME | Backend verifica el tipo real del buffer, no solo la extensión |

#### Reglas de reemplazo
- Se puede reemplazar o eliminar en estados `ELABORADO` y `OBSERVADO`
- Cuando la solicitud está `APROBADO` → archivos **congelados**, sin modificar ni eliminar

### Carga masiva (CSV / XLSX)

| Parámetro | Valor |
|---|---|
| Formatos permitidos | CSV y XLSX |
| Tamaño máximo | 20 MB |
| Filas máximas aprox. | ~3,000 |
| Estrategia | Todo o nada — 1 error rechaza todo el archivo |
| Validación | Al subir, antes de crear la solicitud |

#### Flujo de validación
```
Usuario sube archivo
        │
        ▼
Backend valida fila por fila
        │
        ├── Sin errores → se crea la solicitud normalmente
        │
        └── Con errores → responde con:
                ├── total de filas procesadas
                ├── lista de filas con error + motivo
                ├── archivo TXT descargable
                └── NO se crea la solicitud
```

### Storage
- Servicio recomendado para demo: **Cloudinary** (plan gratuito: 25 GB)
- Para producción: evaluar Cloudinary Pro o Backblaze B2

---

## 8. Notificaciones

### Canales
- **Socket.IO**: notificación instantánea dentro de la app
- **Email**: Nodemailer + Gmail (contraseña de aplicación, no password real)

### Eventos que generan notificación

| Evento | Notifica a |
|---|---|
| Solicitud pasa a `VERIFICADO` | APROBADOR — "Nueva solicitud en bandeja" |
| Solicitud pasa a `OBSERVADO` | CREADOR — "Solicitud observada, revisa comentarios" |
| Solicitud pasa a `RECHAZADO` | CREADOR — "Solicitud rechazada" |
| Solicitud pasa a `APROBADO` | CREADOR — "Solicitud aprobada" |

### Almacenamiento
- Todas las notificaciones se guardan en la tabla `Notificacion`
- Son permanentes — trazables y auditables

### Badge de no leídas
- Contador en navbar con notificaciones donde `leida = false`
- Se actualiza en tiempo real vía Socket.IO
- Al abrir el panel → marca todas como leídas

### Configuración Gmail
```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu_correo@gmail.com
MAIL_PASS=contraseña_de_aplicacion_16_chars
MAIL_FROM="SIAF-RP <tu_correo@gmail.com>"
```

---

## 9. Auditoría

### Principio fundamental
> Los registros de auditoría son **permanentes e intocables**.
> Solo existe `INSERT` — nunca `UPDATE` ni `DELETE`.
> Ni `ADMIN_SISTEMA` puede borrar registros de auditoría.

### ¿Quién puede ver la auditoría?

| Rol | Alcance |
|---|---|
| `ADMIN_SISTEMA` | Todos los eventos del sistema |
| `ADMIN_ENTIDAD` | Solo eventos de su entidad |

### Acciones registradas

| Módulo | Acciones |
|---|---|
| **Autenticación** | login exitoso, login fallido, logout |
| **Usuarios** | creado, editado, activado, desactivado, bloqueado, rol asignado/removido |
| **Entidades** | creada, editada, suspendida, reactivada, migrada, archivada |
| **Unidades** | creada, editada, suspendida, archivada |
| **Solicitudes** | creada, elaborada, verificada, observada, rechazada, aprobada, eliminada |
| **Cuentas contables** | creada al aprobar, atributos modificados, vigencia cambiada |
| **Plan contable** | carga masiva iniciada, carga masiva completada/fallida |
| **Archivos** | archivo subido, archivo reemplazado |

### Filtros disponibles
- Por rango de fechas
- Por usuario
- Por tipo de acción
- Por entidad

### Exportación
- Excel (.xlsx)
- PDF

---

## 10. Secciones del Sistema

### Documentos (solicitudes)

| Rol | Estados visibles |
|---|---|
| `CREADOR` | ELABORADO, VERIFICADO, APROBADO, RECHAZADO, OBSERVADO, ELIMINADO |
| `APROBADOR` | VERIFICADO, APROBADO, RECHAZADO, OBSERVADO |

> El APROBADOR **nunca ve** `ELABORADO` ni `ELIMINADO` — son estados internos del CREADOR.

### Registros (cuentas contables)

| Rol / Entidad | Qué ve |
|---|---|
| CREADOR / APROBADOR DGCP | Cuentas activas (`esVigente = true`) + inactivas (`esVigente = false`) |
| Otras entidades | Solo cuentas generales + cuentas asignadas a su entidad |

---

## 11. Pendientes y Trabajo Futuro

### Estado actual del backend (2026-05-13)

| Módulo | Estado | Notas |
|---|---|---|
| Auth | ✅ Implementado | Login, logout, refresh, OTP, cambiar password/perfil |
| Identity | ✅ Implementado | CRUD usuarios, perfiles, invitaciones |
| Organization | ✅ Implementado | CRUD entidades, unidades, estados |
| Requests | ✅ Implementado | Solicitudes, bandejas, flujo completo |
| ChartAccounts | ✅ Implementado | Planes, cuentas, catálogos |
| Documents | ✅ Implementado | Upload PDF a Cloudinary |
| Notifications | ✅ Implementado | Email Gmail + almacenamiento en BD |
| Socket.IO | ⬜ Pendiente | Notificaciones en tiempo real |
| Auditoría (consulta) | ⬜ Pendiente | Módulo de consulta y exportación |
| Carga masiva | ⬜ Pendiente | CSV/XLSX con validación fila por fila |

### Estado actual del frontend (2026-05-13)

| Módulo | Estado | Notas |
|---|---|---|
| Login / OTP | ✅ Demo | Mock data — pendiente integración |
| Escritorio Virtual | ✅ Demo | Mock data — pendiente integración |
| Plan de Cuentas Contables | ✅ Demo | Mock data — pendiente integración |
| Registro de Asiento de Ajuste | ✅ Demo | Mock data — pendiente integración |
| Admin — Usuarios | ✅ Demo | Mock data — pendiente integración |
| Admin — Entidades | ✅ Demo | Mock data — pendiente integración |
| Admin — Unidades | ✅ Demo | Mock data — pendiente integración |
| Admin — Auditoría | ✅ Demo | Mock data — pendiente integración |
| Integración con backend | ⬜ Pendiente | HttpClient, interceptors, servicios |

### Para implementar en versiones futuras

| Funcionalidad | Prioridad | Notas |
|---|---|---|
| Integración frontend ↔ backend | Alta | HttpClient, JWT interceptor, servicios por módulo |
| Socket.IO | Alta | Notificaciones en tiempo real en navbar |
| WhatsApp (BuilderBot + Baileys) | Media | Notificaciones por WhatsApp además del email |
| Tipo de acción `anulacion` | Media | Anula una solicitud ya creada |
| Exportación auditoría (Excel/PDF) | Media | Usar filtros del módulo de auditoría |
| Contabilidad automática | Alta | Procesos de otros módulos generan docs contables |
| Módulo Presupuesto | Alta | Tendrá sus propios tipos de documento |
| Módulo Tesorería | Alta | Tendrá sus propios tipos de documento |
| Módulo Abastecimiento | Media | Tendrá sus propios tipos de documento |
| Carga masiva CSV/XLSX | Alta | Con validación todo-o-nada y reporte TXT de errores |
| Separación a microservicios | Baja | Solo cuando haya necesidad real de escalar |

### Schema — todos los cambios aplicados

| Campo / Tabla | Estado | Notas |
|---|---|---|
| `TipoDocumento` | ✅ | Catálogo administrado por OGTI — ahora con `procesoId` |
| `Notificacion` | ✅ | Con email y preparado para Socket.IO |
| `OtpVerificacion` | ✅ | Para recuperación de password |
| `EstadoEntidad` enum | ✅ | activa, suspendida, migrada, archivada |
| `EstadoUnidad` enum | ✅ | activa, suspendida, archivada |
| `TipoPlanContable` enum | ✅ | gubernamental_unico, general_empresarial, sistema_financiero |
| `codigoNumerico` en EntidadPublica | ✅ | Auto-incremental, usado en número de solicitud |
| `seccionesModificadas` en SolicitudCuenta | ✅ | ["atributos", "vigencia"] |
| `numeroSolicitud` nullable | ✅ | Se genera al pasar a ELABORADO |
| `ELIMINADO` en EstadoSolicitud | ✅ | Reemplaza ANULADO |
| Índices de rendimiento | ✅ | Solicitud, UsuarioEntidadRol, Historial, Auditoria, Notificacion |
| `telefono` en Usuario | ✅ | Formato +51XXXXXXXXX — para OTP por WhatsApp |
| `ProcesoSistema` | ✅ | Jerarquía catalogo/clasificador/proceso por módulo |
| `ReglaGeneracionAutomatica` | ✅ | Reglas de generación automática entre documentos |
| `CategoriaProcesoSistema` enum | ✅ | catalogo, clasificador, proceso |
| `EstadoContabilizacion` enum | ✅ | **Estándar Motor MEF**: no_aplica, registrado, en_proceso, procesado, fallido |
| `catId` en Solicitud | ✅ | Pendiente definición — nullable |
| `estadoContabilizacion` en Solicitud | ✅ | Estado de contabilización automática (Motor MEF) |
| `fechaRegistroCont` en Solicitud | ✅ | Cuando JSON fue generado exitosamente |
| `fechaEnProceso` en Solicitud | ✅ | Cuando entró a la cola del Motor |
| `fechaProceso` en Solicitud | ✅ | Cuando Motor respondió (procesado o fallido) |
| `numeroAsientoContable` en Solicitud | ✅ | unidad_ejecutora + año_fiscal + correlativo |
| `esGeneradaAutomaticamente` en Solicitud | ✅ | Flag de generación automática |
| `solicitudOrigenId` en Solicitud | ✅ | Trazabilidad hacia el documento que la originó |

---

## 12. Arquitectura escalable por módulo

### Jerarquía de procesos

```
Sistema Nacional (módulo)
└── Gestión Contable / Tesorería / Presupuesto / Abastecimiento
    │
    ├── Catálogos        → Eventos contables, bienes, etc.
    ├── Clasificadores   → Plan de Cuentas, clasificadores presupuestales
    └── Procesos         → Pedidos de contabilización, pagos, etc.
        └── TipoDocumento → nombre del documento (solicitud, expediente, asiento)
            └── TipoDocumentoAccion → creacion, modificacion, reversion, etc.
```

### Campos comunes a todos los documentos (Solicitud)

| Campo visual | Campo en BD |
|---|---|
| Número | `numeroSolicitud` |
| Tipo de Operación | `tipoAccion` |
| Estado | `estado` |
| Sistemas Nacionales | derivado de `tipoDocumento.modulo` |
| Fecha de registro | `createdAt` |
| Creador | `createdBy` → usuario |
| Asunto/Motivo | `justificacion` |
| Código Entidad | `entidadCreadora.codigo` |
| Área Solicitante | `organoLinea` |
| Entidad | `entidadCreadora.nombre` |
| Expediente | `numeroSolicitud` (el nombre cambia según TipoDocumento) |
| Fecha evaluación | historial donde `estadoNuevo = VERIFICADO` |
| Usuario evaluación | idem |
| Fecha aprobación | historial donde `estadoNuevo = APROBADO` |
| Usuario aprobación | idem |
| Cantidad Subdocumentos | COUNT de registros de detalle |
| Estado Contabilización | `estadoContabilizacion` |
| Fecha Contabilización | `fechaProceso` |
| ID CAT CLAS Y CAT | `catId` (pendiente definición) |
| Número Asiento Contable | `numeroAsientoContable` |

### Motor de Contabilización MEF (Referencia: MFD CEL-007.01.01 v5.3)

```
Estados del Motor — estándar oficial MEF:
┌─────────────────────────────────────────────────────────┐
│ no_aplica  → documento sin impacto contable             │
│ registrado → JSON generado exitosamente                 │
│              insertado en tabla documentos aprobados    │
│ en_proceso → enviado al Motor, en cola de validación   │
│              Motor creando asientos contables           │
│ procesado  → Motor respondió OK                         │
│              asiento contable creado                    │
│              numeroAsientoContable se llena             │
│ fallido    → Motor no pudo contabilizar                 │
│              disponible para reprocesar                 │
│              (via GeneraAsientoContable service)        │
└─────────────────────────────────────────────────────────┘

Flujo post-aprobación:
Solicitud APROBADA
    │
    ├── 1. Verificar período contable (GET VerificarPeriodoContable)
    │   └── Si 403 → NO aprobar, notificar al usuario
    │
    ├── 2. Construir JSON estándar MEF
    │   └── Éxito → estadoContabilizacion = registrado
    │              fechaRegistroCont = ahora
    │
    ├── 3. POST InsertarDocumentoAprobado
    │
    ├── 4. POST InsertarDocContabilizar
    │   └── estadoContabilizacion = en_proceso
    │       fechaEnProceso = ahora
    │
    └── 5. Motor procesa y notifica
        ├── OK      → estadoContabilizacion = procesado
        │             fechaProceso = ahora
        │             numeroAsientoContable = unidad+año+correlativo
        └── Fallido → estadoContabilizacion = fallido
                      fechaProceso = ahora

Trazabilidad:
├── Todos los estados son ejecutados por SIAF-RP automáticamente
├── No se guarda "quién" porque siempre es el sistema
├── Solo se guardan las fechas por fase
└── El flujo documental (quién elaboró, verificó, aprobó)
    se consulta vía SolicitudEstadoHistorial (dinámico, multi-módulo)

Web Services del Motor (a implementar):
├── GET  VerificarPeriodoContable  → antes de aprobar
├── POST InsertarDocumentoAprobado → al aprobar
├── POST InsertarDocContabilizar   → encolar para contabilizar
├── POST GeneraAsientoContable     → reprocesar fallidos
├── GET  ObtenerRegistroContable   → obtener asiento PDF
└── GET  ObtenerCorrelativo        → número asiento contable
```

### Generación automática entre sistemas

```
ReglaGeneracionAutomatica define:
├── Documento origen + estado que dispara (ej. APROBADO)
├── Documento destino + estado inicial del generado
├── Módulo origen y módulo destino (pueden ser distintos)
└── Solo OGTI puede administrar estas reglas

Trazabilidad en Solicitud:
├── esGeneradaAutomaticamente = true
├── solicitudOrigenId → documento que la originó
└── estadoContabilizacion → estado del proceso de contabilización
```

### Para agregar un nuevo módulo (ej. Tesorería)

```
1. OGTI crea ProcesoSistema con modulo = 'tesoreria'
2. OGTI crea TipoDocumento con procesoId
3. OGTI define ReglaGeneracionAutomatica si aplica
4. Se crea módulo Angular en modules/tesoreria/
5. Se crea tabla de detalle específica (SolicitudMovimientoTesoro)
6. El flujo NUEVO→ELABORADO→VERIFICADO→APROBADO es el mismo
```

---

*Última actualización: 2026-05-13*
*Actualizar este documento cada vez que se acuerden nuevas reglas o cambios de diseño.*
