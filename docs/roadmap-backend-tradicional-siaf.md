# Roadmap backend tradicional para SIAF-RP

Este documento describe la alternativa sin Supabase para llevar la demo Angular a un entorno con backend propio, base de datos real, autenticacion, roles, archivos y tiempo real.

## Objetivo

Probar el sistema en un servidor real usando una arquitectura clasica:

```text
Angular
NestJS API
PostgreSQL
Prisma
Auth / roles propio
Storage para archivos
Socket.IO
Testing
```

Esta alternativa da mas control sobre la logica de negocio, seguridad, transacciones e integraciones futuras.

## Stack recomendado

```text
Frontend Angular
Backend NestJS
Base de datos PostgreSQL
ORM Prisma
Auth JWT + guards + roles
Storage externo para documentos
Socket.IO para realtime
```

## Donde probar gratis o casi gratis

### Opcion recomendada para demo gratis

```text
Angular: Vercel / Netlify / Cloudflare Pages
NestJS API: Render Free Web Service
PostgreSQL: Neon Free
Prisma: dentro de NestJS
Archivos: Cloudinary Free o Backblaze B2 Free Tier
Realtime: Socket.IO dentro de NestJS
```

Ventajas:

- Separa frontend, backend y base de datos.
- Se parece mas a una arquitectura real de produccion.
- Neon permite conservar mejor la base de datos que una base temporal.
- Socket.IO puede vivir dentro de NestJS.

Desventajas:

- Render Free puede dormir por inactividad.
- El primer request despues de dormir puede tardar.
- Hay que configurar CORS, variables de entorno y build por separado.

### Opcion full-stack simple

```text
Angular + NestJS: Render
PostgreSQL: Render Postgres Free
Prisma: dentro de NestJS
Socket.IO: dentro de NestJS
```

Ventajas:

- Todo queda dentro del ecosistema Render.
- Es simple para una demo rapida.
- Facil de entender para pruebas.

Desventajas:

- Las bases PostgreSQL gratuitas de Render pueden expirar despues de 30 dias.
- No conviene para datos que se quieran conservar mucho tiempo.
- Free Web Services pueden dormir por inactividad.

### Opcion comoda con Railway

```text
Angular + NestJS + PostgreSQL: Railway
Prisma: dentro de NestJS
Socket.IO: dentro de NestJS
```

Ventajas:

- Muy comodo para desplegar servicios.
- Buen soporte para variables de entorno.
- Puede manejar backend, base de datos y servicios juntos.

Desventajas:

- La capa gratuita funciona mas como trial o creditos.
- Para uso continuo puede requerir pago.
- Hay que vigilar consumo de CPU, RAM y almacenamiento.

## Recomendacion para SIAF-RP

Para una demo real, gratuita y ordenada:

```text
Angular: Vercel
NestJS API: Render
PostgreSQL: Neon
Prisma: NestJS
Auth: JWT propio en NestJS
Archivos: Cloudinary o Backblaze B2
Realtime: Socket.IO en NestJS
```

Esta combinacion permite probar:

- Solicitudes reales.
- Login.
- Roles.
- Permisos.
- Bandejas.
- Estados de documento.
- Creacion de cuentas contables.
- Adjuntos.
- Historial.
- Aprobacion.
- Rechazo.
- Observacion.
- Realtime con Socket.IO.

## Comparacion rapida

| Necesidad | Mejor opcion gratis |
| --- | --- |
| Frontend Angular estatico | Vercel, Netlify o Cloudflare Pages |
| Backend NestJS | Render Free Web Service |
| PostgreSQL persistente para demo | Neon Free |
| PostgreSQL temporal de prueba | Render Postgres Free |
| Deploy todo junto | Railway |
| Archivos PDF o imagenes | Cloudinary o Backblaze B2 |
| Realtime custom | Socket.IO en NestJS |

## Arquitectura de referencia

```text
Usuario
Angular en Vercel
NestJS API en Render
PostgreSQL en Neon
Storage externo
Socket.IO en NestJS
```

Flujo:

```text
Angular llama a NestJS por HTTP
NestJS valida JWT y permisos
NestJS usa Prisma para consultar PostgreSQL
NestJS guarda archivos en storage externo
NestJS emite eventos por Socket.IO
Angular actualiza bandejas en tiempo real
```

## Fases propuestas

### Fase 1: Preparar Angular

Objetivo:

- Separar servicios de datos.
- Reemplazar mocks por interfaces.
- Crear variables de entorno para API URL.
- Mantener demo funcionando localmente.

Resultado:

- Angular puede alternar entre mocks y API real.

### Fase 2: Crear NestJS API

Objetivo:

- Crear proyecto NestJS.
- Configurar CORS.
- Crear modulos iniciales.
- Crear health check.
- Configurar variables de entorno.

Modulos sugeridos:

```text
auth
users
roles
requests
documents
accounting-accounts
attachments
status-history
realtime
```

### Fase 3: Modelar PostgreSQL con Prisma

Objetivo:

- Definir `schema.prisma`.
- Crear migraciones.
- Crear seed inicial.
- Conectar NestJS con Neon.

Tablas sugeridas:

```text
users
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

### Fase 4: Auth y roles

Objetivo:

- Login.
- JWT.
- Refresh token si aplica.
- Guards por rol.
- Decoradores de permisos.
- Middleware para usuario actual.

Reglas:

- No confiar permisos solo al frontend.
- NestJS debe validar rol y permisos en cada accion sensible.
- Las acciones de aprobar, verificar, observar y rechazar deben validarse en backend.

### Fase 5: Solicitudes reales

Objetivo:

- Crear solicitud.
- Guardar cuentas contables.
- Guardar justificacion.
- Subir documento de sustento.
- Cambiar estado.
- Registrar historial.

Estados iniciales:

```text
Nuevo
Elaborado
Verificado
Observado
Aprobado
Rechazado
Anulado
```

### Fase 6: Bandejas y filtros

Objetivo:

- Listar solicitudes por rol.
- Filtrar por estado.
- Filtrar por tipo de accion.
- Aplicar filtros personalizados.
- Paginar desde backend.

Recomendacion:

- La paginacion real debe hacerse en backend.
- Los filtros deben enviarse como query params.
- Evitar cargar toda la tabla si habra muchos registros.

### Fase 7: Socket.IO

Objetivo:

- Emitir eventos cuando cambia una solicitud.
- Actualizar bandejas por rol.
- Notificar al creador cuando un aprobador responde.

Eventos sugeridos:

```text
request.created
request.updated
request.elaborated
request.verified
request.observed
request.approved
request.rejected
request.returned
```

Canales sugeridos:

```text
entity:{entityId}
office:{officeId}
role:{role}
user:{userId}
request:{requestId}
```

### Fase 8: Testing

Objetivo:

- Probar servicios Angular.
- Probar controladores NestJS.
- Probar reglas de permisos.
- Probar migraciones Prisma.
- Probar flujos E2E.

Herramientas:

```text
Jest
Supertest
Playwright
Prisma test database
```

## Variables de entorno sugeridas

### Angular

```text
API_URL=https://siaf-api.onrender.com
SOCKET_URL=https://siaf-api.onrender.com
```

### NestJS

```text
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_EXPIRES_IN=...
CORS_ORIGIN=https://siaf-demo.vercel.app
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## Consideraciones por proveedor

### Vercel

Bueno para:

- Angular estatico.
- Deploy desde GitHub.
- Preview deployments.

No ideal para:

- Backend NestJS persistente con Socket.IO.

### Render

Bueno para:

- NestJS API.
- Web services Node.js.
- Pruebas gratuitas.

Cuidar:

- Servicios free pueden dormir.
- Cold start despues de inactividad.
- Bases free pueden tener expiracion.

### Neon

Bueno para:

- PostgreSQL serverless.
- Demo con datos persistentes.
- Escalar luego sin migrar de proveedor.

Cuidar:

- Limites de almacenamiento y compute del plan free.
- Cold start de compute si estuvo inactivo.

### Railway

Bueno para:

- Deploy rapido full-stack.
- Proyectos con varios servicios.
- Desarrollo y prototipos.

Cuidar:

- El plan gratis puede ser trial o creditos.
- Revisar consumo para evitar costos.

## Criterio de decision

Usar esta alternativa tradicional cuando:

- Se quiere control completo del backend.
- Hay reglas de negocio complejas.
- Se necesita Socket.IO personalizado.
- Se planean integraciones externas.
- Se quiere separar API y frontend desde el inicio.

Usar Supabase cuando:

- Se busca avanzar rapido.
- El flujo es principalmente CRUD.
- RLS cubre bien la seguridad.
- Realtime simple es suficiente.
- Se quiere evitar mantener backend al inicio.

## Fuentes utiles

- Render Deploy for Free: https://render.com/docs/free
- Railway Pricing: https://railway.com/pricing
- Neon PostgreSQL: https://neon.com
- Vercel: https://vercel.com
- Netlify: https://www.netlify.com
- Cloudflare Pages: https://pages.cloudflare.com
