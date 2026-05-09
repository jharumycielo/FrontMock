# Roadmap Supabase para SIAF-RP

Este documento propone una ruta para pasar de la demo Angular actual a un flujo con datos reales usando Supabase como backend principal.

## Objetivo

Usar Supabase para acelerar la implementacion de persistencia, autenticacion, roles, almacenamiento de documentos y actualizaciones en tiempo real, sin construir todo el backend desde cero desde el inicio.

## Flujo recomendado

```text
Angular demo completa
Modelo de datos
Supabase
  - PostgreSQL
  - Auth
  - Row Level Security
  - APIs automaticas
  - Storage
  - Realtime
Solicitudes reales
Testing funcional
NestJS o Socket.IO solo si el flujo lo exige
```

## Que reemplaza Supabase

| Paso original | Supabase lo reemplaza | Comentario |
| --- | --- | --- |
| NestJS API | Parcial o totalmente | Para CRUD, consultas simples y flujos directos, Supabase puede exponer la API automaticamente. |
| PostgreSQL + Prisma | Si | Supabase ya usa PostgreSQL. Prisma queda opcional si se mantiene un backend propio. |
| Auth / roles | Si | Supabase Auth permite usuarios; los roles y permisos se pueden aplicar con perfiles y RLS. |
| Solicitudes reales | Si | Las solicitudes, cuentas contables, estados, archivos y trazabilidad pueden guardarse en PostgreSQL. |
| Socket.IO | Parcial | Supabase Realtime puede notificar cambios en bandejas y estados. Socket.IO queda para realtime mas complejo. |

## Arquitectura sugerida

```text
Angular
Supabase Client
Supabase Auth
PostgreSQL + RLS
Storage + Realtime
```

Opcionalmente:

```text
Angular
NestJS API
Supabase PostgreSQL / Auth / Storage
```

Esta segunda opcion sirve cuando la logica de negocio sea compleja o deba centralizarse en un backend controlado.

## Modulos Supabase a usar

### PostgreSQL

Guardar entidades del sistema:

- Usuarios y perfiles.
- Roles y permisos.
- Solicitudes.
- Documentos.
- Estados del flujo.
- Cuentas contables creadas.
- Archivos adjuntos.
- Historial y auditoria.

### Auth

Manejar:

- Inicio de sesion.
- Sesiones.
- Usuario autenticado.
- Relacion con perfil institucional.

### Row Level Security

Controlar acceso por:

- Rol del usuario.
- Entidad.
- Oficina.
- Estado del documento.
- Permisos de lectura, creacion, edicion, verificacion o aprobacion.

### Storage

Guardar documentos de sustento:

- PDF.
- Excel.
- Imagenes si el flujo lo permite.

Cada archivo debe relacionarse con una solicitud y registrar metadata.

### Realtime

Actualizar bandejas cuando:

- Se crea una solicitud.
- Se graba como Elaborado.
- Se verifica.
- Se observa.
- Se aprueba.
- Se rechaza.

## Fases propuestas

### Fase 1: Demo Angular completa

Objetivo:

- Terminar los flujos visuales.
- Validar formularios.
- Alinear modo lectura.
- Alinear tablas, filtros y paginacion.
- Completar las casuisticas de Solicitud de Cuentas Contables.

Resultado:

- Demo funcional con estado local o mocks.

### Fase 2: Modelo de datos

Objetivo:

- Definir tablas.
- Definir relaciones.
- Definir estados.
- Definir roles.
- Definir reglas de auditoria.

Tablas iniciales sugeridas:

```text
profiles
roles
permissions
role_permissions
requests
request_documents
request_status_history
accounting_accounts
request_accounting_accounts
external_entities
attachments
```

### Fase 3: Supabase base

Objetivo:

- Crear proyecto Supabase.
- Crear esquema PostgreSQL.
- Crear policies RLS.
- Configurar Auth.
- Conectar Angular con variables de entorno.

Resultado:

- Angular puede leer y escribir datos reales.

### Fase 4: Solicitudes reales

Objetivo:

- Reemplazar mocks por consultas Supabase.
- Guardar solicitudes.
- Guardar cuentas contables creadas.
- Guardar justificacion.
- Guardar documento de sustento.
- Guardar historial de estado.

Resultado:

- La solicitud ya no vive solo en memoria.

### Fase 5: Bandejas con Realtime

Objetivo:

- Suscribirse a cambios de solicitudes.
- Actualizar bandejas segun rol.
- Refrescar conteos, estados y filas.

Resultado:

- Cuando el creador graba o envia una solicitud, otros roles pueden verla sin recargar.

### Fase 6: Testing

Objetivo:

- Probar formularios.
- Probar reglas de RLS.
- Probar creacion y edicion.
- Probar carga de archivos.
- Probar flujos de estados.

Tipos de pruebas:

- Unitarias.
- Integracion con Supabase local o ambiente staging.
- E2E con Playwright.
- Pruebas manuales por rol.

### Fase 7: Backend opcional

Agregar NestJS solo si aparecen necesidades como:

- Transacciones complejas.
- Reglas de negocio dificiles de mantener en cliente/RLS.
- Integraciones con sistemas externos.
- Firma digital.
- Generacion de documentos.
- Colas, jobs o procesos batch.
- Auditoria avanzada.

Agregar Socket.IO solo si Supabase Realtime no cubre:

- Canales personalizados complejos.
- Presencia de usuarios.
- Colaboracion en vivo.
- Notificaciones con reglas muy especificas.

## Recomendacion para el proyecto actual

Para la etapa actual conviene usar:

```text
Angular
Supabase PostgreSQL
Supabase Auth
RLS por rol
Supabase Storage
Supabase Realtime
```

Y dejar NestJS como una capa futura cuando el flujo funcional ya este validado con datos reales.

## Riesgos a cuidar

- No poner reglas sensibles solo en Angular.
- No desactivar RLS en tablas de negocio.
- No permitir que cualquier usuario lea solicitudes de otras entidades si no corresponde.
- No guardar archivos sin relacionarlos con una solicitud.
- No mezclar estados visuales con estados reales de negocio.
- No duplicar logica de permisos en muchos componentes.

## Criterio de decision

Usar Supabase directamente cuando:

- Es CRUD.
- La regla puede expresarse con RLS.
- La pantalla necesita datos reales rapido.
- El flujo aun esta en validacion funcional.

Usar NestJS cuando:

- La regla necesita transacciones complejas.
- Hay integraciones externas.
- La seguridad requiere una capa server propia.
- Hay procesos asincronos o batch.

Usar Socket.IO cuando:

- Realtime necesita reglas que Supabase Realtime no cubre bien.
- Se requiere presencia, salas complejas o colaboracion en vivo.
