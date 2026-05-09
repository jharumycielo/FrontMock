# Propuesta de modelo SQL para SIAF-RP

Este documento consolida la propuesta de estructura SQL conversada para soportar:

- Plan de cuentas contables.
- Solicitudes de cuentas contables.
- Usuarios, roles y permisos.
- Entidades publicas y unidades organicas.
- Bandejas por rol, entidad y unidad.
- Archivos de sustento.
- Auditoria.
- Sesiones.
- Evolucion futura hacia monolito modular o microservicios.

## Principios del modelo

- Separar cuenta oficial aprobada de cuenta solicitada.
- Permitir que una solicitud tenga una o muchas cuentas contables.
- Soportar jerarquia de cuentas mediante `parent_id`.
- Soportar multiples roles por usuario.
- Amarrar cada rol a una entidad publica y unidad organica.
- Controlar modulos por permisos.
- Registrar auditoria desde el inicio.
- Evitar guardar reglas sensibles solo en frontend.
- Preparar el modelo para crecer sin obligar a usar microservicios desde el dia uno.

## Vista general

```text
usuario
  usuario_entidad_rol
    entidad_publica
    unidad_organica
    rol
      rol_permiso
        permiso
          modulo_permiso
            modulo

plan_contable
  cuenta_contable
    cuenta_contable_ambito
    cuenta_contable_entidad_estado

solicitud
  solicitud_cuenta_contable
    solicitud_cuenta_ambito
    solicitud_cuenta_entidad_estado
  solicitud_sustento
  solicitud_estado_historial

archivo
auditoria_evento
usuario_sesion
usuario_invitacion
```

## Seguridad, usuarios y roles

### `usuario`

Cuenta de acceso al sistema.

```sql
create table usuario (
  id uuid primary key,
  dni varchar(20) unique not null,
  nombres varchar(150) not null,
  apellidos varchar(150) not null,
  email varchar(200) unique not null,
  password_hash varchar(300) not null,
  estado varchar(30) not null,
  debe_cambiar_password boolean not null default true,
  ultimo_acceso timestamp null,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now(),
  created_by uuid null,
  updated_by uuid null
);
```

Estados sugeridos:

```text
activo
inactivo
bloqueado
pendiente_activacion
```

### `entidad_publica`

Institucion publica a la que pertenece un usuario o una solicitud.

```sql
create table entidad_publica (
  id uuid primary key,
  codigo varchar(30) unique not null,
  ruc varchar(20) null,
  nombre varchar(250) not null,
  tipo_entidad varchar(50) not null,
  entidad_padre_id uuid null references entidad_publica(id),
  es_activa boolean not null default true,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);
```

Tipos de entidad sugeridos:

```text
ministerio
municipalidad
gobierno_regional
unidad_ejecutora
organismo_publico
empresa_publica
otra
```

### `unidad_organica`

Direccion, oficina, area o unidad dentro de una entidad.

```sql
create table unidad_organica (
  id uuid primary key,
  entidad_publica_id uuid not null references entidad_publica(id),
  codigo varchar(30) not null,
  nombre varchar(250) not null,
  tipo_unidad varchar(50) not null,
  es_activa boolean not null default true,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now(),
  unique (entidad_publica_id, codigo)
);
```

Ejemplo:

```text
Entidad: Ministerio de Economia y Finanzas
Unidad: Direccion General de Contabilidad Publica
```

### `rol`

Catalogo de roles.

```sql
create table rol (
  id uuid primary key,
  codigo varchar(50) unique not null,
  nombre varchar(100) not null,
  descripcion text null,
  es_activo boolean not null default true
);
```

Roles minimos:

```text
ADMIN_SISTEMA
ADMIN_ENTIDAD
ADMIN_UNIDAD
CREADOR
APROBADOR
REVISOR
CONSULTA
```

### `permiso`

Catalogo de acciones permitidas.

```sql
create table permiso (
  id uuid primary key,
  codigo varchar(100) unique not null,
  descripcion text null
);
```

Permisos sugeridos:

```text
user.create
user.read
user.update
user.disable
role.assign
entity.create
entity.update
unit.create
unit.update
module.read
module.assign
document.create
document.read
document.edit
document.verify
document.approve
document.observe
document.reject
document.annul
chart_account.create
chart_account.edit
chart_account.approve
```

### `rol_permiso`

Permisos asignados a cada rol.

```sql
create table rol_permiso (
  rol_id uuid not null references rol(id),
  permiso_id uuid not null references permiso(id),
  primary key (rol_id, permiso_id)
);
```

### `usuario_entidad_rol`

Tabla central de perfiles de acceso. Define con que rol actua un usuario dentro de una entidad y unidad.

```sql
create table usuario_entidad_rol (
  id uuid primary key,
  usuario_id uuid not null references usuario(id),
  entidad_publica_id uuid not null references entidad_publica(id),
  unidad_organica_id uuid null references unidad_organica(id),
  rol_id uuid not null references rol(id),
  ambito varchar(30) not null,
  es_principal boolean not null default false,
  es_activo boolean not null default true,
  fecha_inicio date not null,
  fecha_fin date null,
  created_at timestamp not null default now(),
  created_by uuid null references usuario(id)
);
```

Ambitos sugeridos:

```text
sistema
nacional
entidad
unidad
```

Ejemplos:

```text
Usuario: Juan Perez
Entidad: Ministerio de Economia y Finanzas
Unidad: Direccion General de Contabilidad Publica
Rol: APROBADOR
Ambito: nacional

Usuario: Juan Perez
Entidad: Municipalidad Provincial X
Unidad: Oficina de Contabilidad
Rol: CREADOR
Ambito: entidad
```

## Modulos visibles por rol y permiso

### `modulo`

Catalogo de modulos y rutas disponibles.

```sql
create table modulo (
  id uuid primary key,
  codigo varchar(100) unique not null,
  nombre varchar(150) not null,
  ruta varchar(250) null,
  icono varchar(100) null,
  orden int not null default 0,
  modulo_padre_id uuid null references modulo(id),
  es_activo boolean not null default true
);
```

### `modulo_permiso`

Relaciona modulos con permisos. El frontend puede mostrar modulos segun los permisos del perfil activo.

```sql
create table modulo_permiso (
  modulo_id uuid not null references modulo(id),
  permiso_id uuid not null references permiso(id),
  primary key (modulo_id, permiso_id)
);
```

## Sesiones e invitaciones

### `usuario_sesion`

Permite controlar refresh tokens, cierre de sesion y perfil activo.

```sql
create table usuario_sesion (
  id uuid primary key,
  usuario_id uuid not null references usuario(id),
  perfil_activo_id uuid null references usuario_entidad_rol(id),
  refresh_token_hash varchar(300) not null,
  ip varchar(80) null,
  user_agent text null,
  expira_en timestamp not null,
  revocada_en timestamp null,
  created_at timestamp not null default now()
);
```

### `usuario_invitacion`

Opcional para que un administrador cree usuarios y estos definan su password mediante enlace.

```sql
create table usuario_invitacion (
  id uuid primary key,
  email varchar(200) not null,
  entidad_publica_id uuid not null references entidad_publica(id),
  unidad_organica_id uuid null references unidad_organica(id),
  rol_id uuid not null references rol(id),
  token_hash varchar(300) not null,
  expira_en timestamp not null,
  aceptada_en timestamp null,
  created_by uuid not null references usuario(id),
  created_at timestamp not null default now()
);
```

## Plan de cuentas contables

### `plan_contable`

Cabecera del plan de cuentas.

```sql
create table plan_contable (
  id uuid primary key,
  numero_plan_contable varchar(30) unique not null,
  descripcion varchar(250) not null,
  fecha date not null,
  vigencia_plan_contable varchar(50) not null,
  fecha_inicio_desde date not null,
  fecha_fin_hasta date null,
  es_vigente boolean not null default true,
  es_visible boolean not null default true,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);
```

### `cuenta_contable`

Cuenta oficial aprobada dentro del plan.

```sql
create table cuenta_contable (
  id uuid primary key,
  plan_contable_id uuid not null references plan_contable(id),
  parent_id uuid null references cuenta_contable(id),
  codigo_completo varchar(80) not null,
  elemento varchar(2) not null,
  grupo varchar(2) null,
  cuenta varchar(2) null,
  subcuenta_1 varchar(2) null,
  subcuenta_2 varchar(2) null,
  subcuenta_3 varchar(2) null,
  nivel int not null,
  nombre varchar(250) not null,
  codigo_anterior varchar(80) null,
  es_imputable boolean not null,
  naturaleza varchar(50) not null,
  tipo_elemento varchar(50) not null,
  es_monetaria boolean not null,
  aplica_extra_presupuestaria boolean not null default false,
  es_reciproca boolean not null default false,
  ac_activo varchar(20) null,
  pc_pasivo varchar(20) null,
  anc_activo varchar(20) null,
  pnc_pasivo varchar(20) null,
  tiene_dinamica_contable boolean not null default false,
  dinamica_debita text null,
  dinamica_acredita text null,
  dinamica_objeto text null,
  dinamica_saldos text null,
  es_para_entidad_estado boolean not null default false,
  es_vigente boolean not null default true,
  es_visible boolean not null default true,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now(),
  created_by uuid null references usuario(id),
  updated_by uuid null references usuario(id),
  unique (plan_contable_id, codigo_completo)
);
```

### `ambito_institucional`

Catalogo de ambitos institucionales.

```sql
create table ambito_institucional (
  id uuid primary key,
  codigo varchar(30) unique not null,
  descripcion varchar(250) not null,
  es_activo boolean not null default true
);
```

Ejemplos:

```text
EPE
EPL
EPJ
OCA
GR
GL
ETE
EPP
EPD
FF
OR
OS
```

### `cuenta_contable_ambito`

Relacion muchos a muchos entre cuenta oficial y ambitos.

```sql
create table cuenta_contable_ambito (
  cuenta_contable_id uuid not null references cuenta_contable(id),
  ambito_institucional_id uuid not null references ambito_institucional(id),
  primary key (cuenta_contable_id, ambito_institucional_id)
);
```

### `cuenta_contable_entidad_estado`

Relacion entre cuenta oficial y entidades publicas, cuando aplica.

```sql
create table cuenta_contable_entidad_estado (
  cuenta_contable_id uuid not null references cuenta_contable(id),
  entidad_publica_id uuid not null references entidad_publica(id),
  primary key (cuenta_contable_id, entidad_publica_id)
);
```

## Solicitudes

### `solicitud`

Cabecera de la solicitud.

```sql
create table solicitud (
  id uuid primary key,
  numero_solicitud varchar(30) unique not null,
  tipo_solicitud varchar(80) not null,
  tipo_accion varchar(50) not null,
  fecha_requerimiento date not null,
  hora_requerimiento time not null,
  organo_linea varchar(250) not null,
  entidad_creadora_id uuid not null references entidad_publica(id),
  unidad_creadora_id uuid null references unidad_organica(id),
  perfil_creador_id uuid not null references usuario_entidad_rol(id),
  entidad_destino_id uuid null references entidad_publica(id),
  unidad_destino_id uuid null references unidad_organica(id),
  rol_destino_id uuid null references rol(id),
  estado varchar(50) not null,
  justificacion text not null,
  proviene_entidad_externa boolean not null default false,
  entidad_externa_id uuid null references entidad_publica(id),
  created_at timestamp not null default now(),
  updated_at timestamp not null default now(),
  created_by uuid not null references usuario(id),
  updated_by uuid null references usuario(id)
);
```

Ejemplo de flujo:

```text
Municipalidad crea solicitud:
- entidad_creadora_id = Municipalidad
- unidad_creadora_id = Oficina de Contabilidad
- perfil_creador_id = perfil CREADOR de la municipalidad

La solicitud va a DGCP / MEF:
- entidad_destino_id = Ministerio de Economia y Finanzas
- unidad_destino_id = Direccion General de Contabilidad Publica
- rol_destino_id = APROBADOR
```

### `solicitud_cuenta_contable`

Detalle de cuentas propuestas dentro de una solicitud.

```sql
create table solicitud_cuenta_contable (
  id uuid primary key,
  solicitud_id uuid not null references solicitud(id),
  plan_contable_id uuid not null references plan_contable(id),
  cuenta_contable_origen_id uuid null references cuenta_contable(id),
  codigo_completo varchar(80) not null,
  elemento varchar(2) not null,
  grupo varchar(2) null,
  cuenta varchar(2) null,
  subcuenta_1 varchar(2) null,
  subcuenta_2 varchar(2) null,
  subcuenta_3 varchar(2) null,
  nivel int not null,
  nombre varchar(250) not null,
  codigo_anterior varchar(80) null,
  es_imputable boolean not null,
  naturaleza varchar(50) not null,
  tipo_elemento varchar(50) not null,
  es_monetaria boolean not null,
  aplica_extra_presupuestaria boolean not null default false,
  es_reciproca boolean not null default false,
  ac_activo varchar(20) null,
  pc_pasivo varchar(20) null,
  anc_activo varchar(20) null,
  pnc_pasivo varchar(20) null,
  tiene_dinamica_contable boolean not null default false,
  dinamica_debita text null,
  dinamica_acredita text null,
  dinamica_objeto text null,
  dinamica_saldos text null,
  es_para_entidad_estado boolean not null default false,
  es_vigente boolean not null default true,
  es_visible boolean not null default true,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);
```

### `solicitud_cuenta_ambito`

Ambitos seleccionados para la cuenta solicitada.

```sql
create table solicitud_cuenta_ambito (
  solicitud_cuenta_contable_id uuid not null references solicitud_cuenta_contable(id),
  ambito_institucional_id uuid not null references ambito_institucional(id),
  primary key (solicitud_cuenta_contable_id, ambito_institucional_id)
);
```

### `solicitud_cuenta_entidad_estado`

Entidades seleccionadas para la cuenta solicitada.

```sql
create table solicitud_cuenta_entidad_estado (
  solicitud_cuenta_contable_id uuid not null references solicitud_cuenta_contable(id),
  entidad_publica_id uuid not null references entidad_publica(id),
  primary key (solicitud_cuenta_contable_id, entidad_publica_id)
);
```

### `archivo`

Metadata del archivo fisico.

```sql
create table archivo (
  id uuid primary key,
  nombre_original varchar(250) not null,
  nombre_storage varchar(250) not null,
  extension varchar(20) not null,
  mime_type varchar(100) not null,
  size_bytes bigint not null,
  storage_path varchar(500) not null,
  created_at timestamp not null default now(),
  created_by uuid not null references usuario(id)
);
```

### `solicitud_sustento`

Relacion entre solicitud y archivo de sustento.

```sql
create table solicitud_sustento (
  id uuid primary key,
  solicitud_id uuid not null references solicitud(id),
  archivo_id uuid not null references archivo(id),
  tipo_sustento varchar(80) not null,
  created_at timestamp not null default now()
);
```

### `solicitud_estado_historial`

Trazabilidad de estados de la solicitud.

```sql
create table solicitud_estado_historial (
  id uuid primary key,
  solicitud_id uuid not null references solicitud(id),
  estado_anterior varchar(50) null,
  estado_nuevo varchar(50) not null,
  comentario text null,
  created_at timestamp not null default now(),
  created_by uuid not null references usuario(id),
  perfil_id uuid null references usuario_entidad_rol(id)
);
```

Estados sugeridos:

```text
NUEVO
ELABORADO
VERIFICADO
OBSERVADO
APROBADO
RECHAZADO
ANULADO
```

## Auditoria

### `auditoria_evento`

Registra acciones relevantes del sistema.

```sql
create table auditoria_evento (
  id uuid primary key,
  usuario_id uuid not null references usuario(id),
  perfil_id uuid null references usuario_entidad_rol(id),
  entidad_publica_id uuid null references entidad_publica(id),
  unidad_organica_id uuid null references unidad_organica(id),
  accion varchar(120) not null,
  tabla_afectada varchar(120) null,
  registro_id uuid null,
  valor_anterior jsonb null,
  valor_nuevo jsonb null,
  ip varchar(80) null,
  user_agent text null,
  created_at timestamp not null default now()
);
```

Ejemplos de acciones:

```text
usuario.login
usuario.creado
rol.asignado
solicitud.creada
solicitud.grabada
solicitud.verificada
solicitud.aprobada
solicitud.observada
cuenta_contable.creada
archivo.subido
```

## Bandejas por rol y entidad

El perfil activo define que ve el usuario:

```text
perfil activo =
usuario + entidad_publica + unidad_organica + rol + ambito
```

Consulta conceptual para bandeja del creador:

```sql
select *
from solicitud
where created_by = :usuario_id
   or perfil_creador_id = :perfil_id;
```

Consulta conceptual para bandeja de aprobador:

```sql
select *
from solicitud
where entidad_destino_id = :entidad_publica_id
  and unidad_destino_id = :unidad_organica_id
  and rol_destino_id = :rol_id
  and estado in ('VERIFICADO', 'OBSERVADO');
```

Si el aprobador tiene ambito `nacional`, puede tener reglas adicionales para ver solicitudes de multiples entidades.

## Administracion de usuarios

Para crear usuarios debe existir al menos una cuenta administradora.

Roles administrativos:

```text
ADMIN_SISTEMA
ADMIN_ENTIDAD
ADMIN_UNIDAD
```

### `ADMIN_SISTEMA`

Puede administrar:

- Entidades publicas.
- Unidades organicas.
- Usuarios.
- Roles.
- Permisos.
- Modulos.
- Auditoria global.

### `ADMIN_ENTIDAD`

Puede administrar:

- Usuarios de su entidad.
- Roles permitidos dentro de su entidad.
- Accesos activos/inactivos de su entidad.
- Auditoria de su entidad.

### `ADMIN_UNIDAD`

Puede administrar:

- Usuarios de su unidad.
- Asignaciones dentro de su unidad.
- Consulta de accesos de su unidad.

## Microservicios

El modelo puede soportar microservicios, pero se recomienda empezar con monolito modular.

### Fase recomendada

```text
Fase 1: Monolito modular NestJS
Fase 2: Base de datos bien modelada
Fase 3: Eventos internos
Fase 4: Separar servicios cuando exista necesidad real
```

### Modulos iniciales en monolito modular

```text
auth
identity
organization
requests
chart-accounts
documents
notifications
audit
realtime
```

### Posibles microservicios futuros

| Servicio | Responsabilidad |
| --- | --- |
| `auth-service` | Login, tokens, sesiones y refresh tokens. |
| `identity-service` | Usuarios, roles, permisos y perfiles de acceso. |
| `organization-service` | Entidades publicas, unidades y jerarquias. |
| `request-service` | Solicitudes, estados, historial y bandejas. |
| `chart-accounts-service` | Plan contable y reglas de cuentas contables. |
| `document-service` | Archivos, metadata y storage. |
| `notification-service` | Correos y notificaciones internas. |
| `audit-service` | Auditoria de acciones y cambios. |
| `realtime-service` | Socket.IO, eventos y bandejas en vivo. |

### Cuando separar a microservicios

Separar cuando:

- Hay equipos trabajando en dominios distintos.
- Realtime necesita escalar aparte.
- Auditoria tiene mucho volumen.
- Documentos y storage crecen de forma independiente.
- Las reglas contables necesitan despliegues propios.
- Existen integraciones externas con ciclos distintos.

No separar todavia si:

- El modelo de datos aun cambia mucho.
- Solo se esta validando la demo.
- Hay un equipo pequeno.
- No hay CI/CD ni observabilidad madura.
- La prioridad es avanzar rapido.

## Recomendacion final

Para el estado actual del proyecto:

```text
Angular demo completa
Modelo SQL definido
Monolito modular NestJS o Supabase segun decision
PostgreSQL
Auth y perfiles por entidad
Solicitudes reales
Testing
Realtime
Microservicios solo cuando exista necesidad real
```

La base mas importante es dejar bien definido:

- `usuario_entidad_rol`
- `entidad_publica`
- `unidad_organica`
- `rol`
- `permiso`
- `solicitud`
- `solicitud_cuenta_contable`
- `solicitud_estado_historial`
- `auditoria_evento`

Con eso se soportan multiples roles, multiples entidades, bandejas por perfil, aprobadores centralizados como DGCP/MEF y creadores de municipalidades, unidades ejecutoras u otras entidades publicas.
