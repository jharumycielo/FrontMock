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

### Seguridad
- Nunca revelar si el DNI existe: siempre `401 "Credenciales incorrectas"`
- Los refresh tokens se almacenan como hash (bcrypt)
- Las sesiones revocadas no pueden generar nuevos tokens

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

### Para implementar en versiones futuras

| Funcionalidad | Prioridad | Notas |
|---|---|---|
| Tipo de acción `anulacion` de solicitudes | Media | Anula una solicitud ya creada |
| Contabilidad automática | Alta | Procesos de otros módulos generan docs contables automáticamente |
| Módulo Tesorería | Alta | Tendrá sus propios tipos de documento |
| Módulo Presupuesto | Alta | Tendrá sus propios tipos de documento |
| Módulo Abastecimiento | Media | Tendrá sus propios tipos de documento |
| Separación a microservicios | Baja | Solo cuando haya equipos distintos y necesidad real de escalar |
| Exportación de reportes contables | Media | Usar `esVisible` para filtrar |
| Seed inicial de datos | Alta | Roles, permisos, módulos, tipos de documento base |

### Cambios pendientes en el schema

| Campo / Tabla | Estado | Notas |
|---|---|---|
| Índices de rendimiento | ✅ Agregados | En Solicitud, UsuarioEntidadRol, Historial, Auditoria, Notificacion |
| `TipoDocumento` | ✅ Creado | Catálogo administrado por OGTI |
| `Notificacion` | ✅ Creado | Con email y Socket.IO |
| `EstadoEntidad` enum | ✅ Creado | Reemplaza esActiva en EntidadPublica |
| `EstadoUnidad` enum | ✅ Creado | Reemplaza esActiva en UnidadOrganica |
| `TipoPlanContable` enum | ✅ Creado | Determina si el plan es editable |
| `seccionesModificadas` en SolicitudCuenta | ✅ Agregado | ["atributos", "vigencia"] |
| `numeroSolicitud` nullable | ✅ Corregido | Se genera al pasar a ELABORADO |
| `ELIMINADO` en EstadoSolicitud | ✅ Corregido | Reemplaza ANULADO |

---

*Documento generado durante el levantamiento de requerimientos del módulo de Gestión Contable SIAF-RP.*
*Actualizar este documento cada vez que se acuerden nuevas reglas o cambios de diseño.*
