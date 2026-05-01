# Plantilla de prompts para armar pantallas SIAF

Esta guia sirve para pedir nuevas pantallas o modificar flujos como piezas reutilizables. La idea es que el prompt indique rol, estado, estructura visual, formulario, acciones y comportamiento esperado.

## Prompt base

```md
## Contexto

Pantalla o flujo:
Rol:
Estado del documento:
Estado del header:
Proceso:
Documento:
Tipo de accion:
Referencia Figma:

## Objetivo

Describe que debe pasar en esta pantalla o flujo.

## Header de solicitud

Titulo:
Subtitulo / tipo de accion:
Rol del header:
Estado del header:
Botones visibles:
Botones ocultos:
Boton principal:
Comportamiento al volver:

## Breadcrumb

Ruta esperada:
- Nivel 1:
- Nivel 2:
- Nivel 3:
- Nivel final:

En movil:
- Mostrar ultimo nivel:
- El resto debe ir dentro de "...":

## Modo de pantalla

Editable:
Solo lectura:
Estado visual:
Campos bloqueados:
Campos que se pueden editar:

## Formulario

Secciones:
- Nombre de seccion:
  - Campos:
  - Obligatorios:
  - Validaciones:
  - Componentes esperados:

## Tablas

Tabla:
Columnas:
Acciones por fila:
Estados posibles:
Paginacion:
Filtros:

## Modales

Modal:
Cuando aparece:
Titulo:
Mensaje:
Botones:
Accion al aceptar:
Accion al cancelar:

## Snackbar / alerta

Cuando aparece:
Mensaje:
Debe usar numero de documento:
Tipo visual:
Tiempo visible:

## Navegacion

Al aceptar:
Al guardar:
Al editar:
Al verificar:
Al aprobar:
Al observar:
Al rechazar:
Al cancelar:

## Reglas especiales

- Regla 1:
- Regla 2:
- Regla 3:
```

## Roles recomendados

Usar estos valores para que el codigo pueda mapear el header y las acciones:

| Rol en prompt | Valor en codigo | Uso esperado |
| --- | --- | --- |
| Creador | `creator` | Crea, guarda, edita y envia/verifica segun el flujo. |
| Revisor | `reviewer` | Revisa informacion y puede observar o derivar. |
| Aprobador | `approver` | Aprueba, observa o rechaza una solicitud. |

## Reglas de arquitectura por rol

La estructura del codigo se organiza por proceso o dominio, no por rol. Los roles se aplican con permisos, guards y configuracion de componentes.

Reglas:

- Crear carpetas por proceso, por ejemplo `features/adjustment-seat`.
- No crear carpetas principales como `features/creator` o `features/approver`.
- Usar `roleGuard` solo cuando una ruta completa sea exclusiva para uno o varios roles.
- Usar `PermissionService` cuando una misma pantalla cambie botones, campos o acciones segun el rol.
- Usar `siaf-solicitude-header` con `role` + `state` para variantes del encabezado.
- Si la pantalla es casi igual entre roles, reutilizar la misma pagina y cambiar permisos/acciones.
- Si la pantalla cambia mucho, crear componentes internos por caso dentro del mismo feature.

Base tecnica disponible:

```ts
import { roleGuard } from './core/auth';

{
  path: 'procesos/registro-asiento-ajuste/solicitud',
  canActivate: [roleGuard],
  data: {
    roles: ['creator', 'approver'],
    permissions: ['document.read']
  },
  loadComponent: () => import('./features/adjustment-seat-request/adjustment-seat-request.component').then((m) => m.AdjustmentSeatRequestComponent)
}
```

Para comportamiento dentro de una pantalla:

```ts
readonly role = this.permission.currentRole;

canEdit = this.permission.can('document.edit');
canApprove = this.permission.can('document.approve');
```

## Permisos recomendados

| Permiso | Uso |
| --- | --- |
| `document.create` | Crear solicitudes o documentos. |
| `document.edit` | Editar documentos elaborados u observados. |
| `document.delete` | Eliminar documentos. |
| `document.verify` | Verificar documentos elaborados. |
| `document.review` | Revisar documentos. |
| `document.approve` | Aprobar documentos verificados. |
| `document.observe` | Observar documentos. |
| `document.reject` | Rechazar documentos. |
| `document.annul` | Anular documentos. |
| `document.read` | Visualizar documentos en modo lectura. |

## Estados recomendados

Usar estos valores cuando el prompt describa el estado del documento. Estos estados salen del componente `FlowTags` del UI Kit SIAF - RP.

| Estado en prompt | Valor en codigo | Color / tono Figma | Uso esperado |
| --- | --- | --- | --- |
| Elaborado | `elaborated` | Default | Documento creado por el rol creador. |
| Registrado | `registered` | Default | Documento registrado en el flujo. |
| Verificado | `verified` | Info | Documento verificado y listo para el siguiente rol. |
| Validado | `validated` | Info | Documento validado por una etapa intermedia. |
| Revisado | `reviewed` | Info | Documento revisado por un rol de control. |
| Generado | `generated` | Info | Documento generado por el sistema o por un proceso. |
| En proceso | `in_process` | Info | Documento en ejecucion o procesamiento. |
| Autorizado | `authorized` | Success | Documento autorizado por el rol responsable. |
| Firmado | `signed` | Success | Documento firmado. |
| Aprobado | `approved` | Success | Documento aprobado. |
| Aceptado | `accepted` | Success | Documento aceptado por el flujo. |
| Publicado | `published` | Success | Documento publicado. |
| Procesado | `processed` | Success | Documento procesado correctamente. |
| Observado | `observed` | Warning | Documento observado, normalmente requiere correccion. |
| Pendiente | `pending` | Warning | Documento pendiente de accion. |
| Fallido | `failed` | Warning | Proceso fallido o con error funcional recuperable. |
| Eliminado | `deleted` | Danger | Documento enviado a papelera o eliminado. |
| Rechazado | `rejected` | Danger | Documento rechazado por un rol de decision. |
| Anulado | `annulled` | Danger | Documento anulado. |

## Estados del header

El estado del documento no siempre es igual al estado visual del header. Para construir pantallas, separar ambos datos:

| Estado del header | Valor en codigo | Comportamiento |
| --- | --- | --- |
| Nuevo | `new` | Formulario editable, tag Nuevo, acciones de creacion. |
| Edicion | `edit` | Formulario editable con datos existentes, tag Edicion. |
| Solo lectura | `readonly` | Pantalla bloqueada sin asumir un estado de negocio. |
| Elaborado | `elaborated` | Modo lectura para creador, puede permitir Editar o Verificar segun el rol. |
| Verificado | `verified` | Modo lectura para roles posteriores, puede habilitar Aprobar, Observar o Rechazar. |
| Aprobado | `approved` | Modo lectura de cierre positivo. |
| Observado | `observed` | Modo lectura o edicion condicionada segun rol. |
| Rechazado | `rejected` | Modo lectura de cierre negativo. |

Regla para prompts:

- `Estado del documento`: controla el tag de estado y la informacion de negocio.
- `Estado del header`: controla botones, permisos y si la pantalla es editable o lectura.
- Si ambos son iguales, indicarlo una sola vez.
- Si no son iguales, indicarlos por separado.

## Componentes reutilizables

Cuando pidas una pantalla, puedes indicar estas piezas:

| Pieza | Componente sugerido | Cuando usarlo |
| --- | --- | --- |
| Navbar | `siaf-navbar` | Todas las pantallas internas. |
| Sidebar | `siaf-sidebar` | Navegacion principal con Procesos, Bandeja y Crear. |
| Breadcrumb | `siaf-breadcrumb` | Ruta segun arbol de procesos o seccion actual. |
| Layout solicitud | `siaf-solicitude-page-layout` | Estructura transversal para breadcrumb, header, gaps y padding de formularios de solicitud. |
| Header solicitud | `siaf-solicitude-header` | Encabezado de formularios de solicitud. |
| Tag de estado de flujo | `siaf-flow-status-tag` | Estado visual del documento usando colores del UI Kit. |
| Crear documento | `siaf-create-document` | Panel lateral desde el boton Crear. |
| Arbol procesos | `siaf-process-menu-tree` | Menu de procesos desde el sidebar. |
| Date picker | `siaf-date-time-picker` | Campos de fecha o fecha/hora. |
| Boton | `siaf-button` | Acciones con iconos y variantes del sistema. |
| Modal | `siaf-modal` | Confirmaciones y decisiones bloqueantes. |
| Snackbar | `siaf-snackbar` | Confirmaciones no bloqueantes. |
| Paginacion | `siaf-pagination` | Tablas con resultados. |

## Layout transversal de solicitud

Toda pantalla de creacion, edicion o lectura de una solicitud debe usar `siaf-solicitude-page-layout`. Este componente centraliza:

- Breadcrumb.
- Header de solicitud.
- Padding externo del formulario.
- Gap entre secciones.
- Desplazamiento lateral cuando se abre el sidebar de Procesos, Bandeja o Crear documento.

Reglas:

- No redefinir gaps o paddings principales dentro de cada proceso.
- El proceso solo debe enviar `breadcrumbs`, `role`, `state`, `heading`, `secondaryText` y estados de botones.
- El contenido interno del formulario se proyecta dentro del layout.
- Si Figma cambia el espaciado general de solicitudes, modificar `siaf-solicitude-page-layout`, no cada pantalla.

Uso:

```html
<siaf-solicitude-page-layout
  [breadcrumbs]="breadcrumbs"
  role="creator"
  [state]="solicitudeHeaderState"
  heading="Solicitud de registro de asiento de ajuste"
  secondaryText="Creacion"
  [saveDisabled]="!isFormValid"
  [verifyDisabled]="!isReadOnly"
>
  <!-- Secciones internas del formulario -->
</siaf-solicitude-page-layout>
```

## Crear documento transversal

`siaf-create-document` debe usarse como componente transversal. La pantalla o proceso que lo abre debe enviar la relacion entre proceso, documentos, tipos de accion y ruta destino.

Estructura esperada:

```ts
const CREATE_DOCUMENT_OPTIONS = [
  {
    id: 'registro-asiento-ajuste',
    label: 'Proceso de registro de asiento de ajuste',
    route: '/procesos/registro-asiento-ajuste/solicitud',
    documents: ['Solicitud de registro de asiento de ajuste'],
    actionTypes: ['Creacion']
  }
];
```

Uso:

```html
<siaf-create-document
  [processOptions]="createDocumentProcessOptions"
  (accepted)="onCreateDocumentAccepted($event)"
/>
```

Reglas:

- No hardcodear documentos ni tipos de accion dentro de `siaf-create-document`.
- Cada proceso define su data: `id`, `label`, `route`, `documents` y `actionTypes`.
- Si un proceso tiene mas de un documento, todos deben venir en `documents`.
- Si un documento tiene acciones distintas por rol o estado, filtrarlas antes de pasarlas al componente.
- Al aceptar, navegar usando `selection.route` para que el flujo funcione con cualquier proceso.

## Pantalla transversal de documentos y registros

Usar esta plantilla cuando quieras crear una nueva seccion como la de `Documentos y registros` para cualquier proceso. La pantalla debe reutilizar la estructura existente: navbar, sidebar, breadcrumb del arbol de procesos, header del proceso, tabs `Documentos` y `Registros`, boton `Crear documento`, tabla, filtros, paginacion e historial.

```md
## Contexto

Pantalla o flujo: Documentos y registros
Proceso:
Id del proceso:
Ruta del proceso:
Ruta para crear solicitud:
Breadcrumb segun arbol:
- Nivel 1:
- Nivel 2:
- Nivel 3:
- Nivel final:
Referencia Figma:

## Header de la pantalla

Titulo:
Subtitulo: Documentos y registros
Sistema: Sistema Nacional de Contabilidad

## Crear documento

Debe usar `siaf-create-document`: si
Documentos permitidos:
- Documento:
  - Ruta:
  - Tipos de accion permitidos:
    - Creacion
    - Modificacion
    - Eliminacion

Reglas:
- Al elegir documento y tipo de accion, habilitar Aceptar.
- Al aceptar, navegar a la ruta del documento seleccionado.
- La grilla de Documentos debe reflejar los mismos nombres definidos en `Documentos permitidos`.
- Si hay mas de un documento, el select Documento debe mostrar todos.
- Si un documento tiene acciones propias, el select Tipo de accion debe mostrar solo las acciones de ese documento.

## Tabla Documentos

Columnas:
- Documento
- Numero
- Tipo de accion
- Estado
- Sistema
- Fecha de registro
- Entidad

Filas de ejemplo:
- Documento:
  Numero:
  Tipo de accion:
  Estado:
  Sistema:
  Fecha de registro:
  Entidad:

Estados disponibles:
- Elaborado
- Verificado
- Aprobado
- Observado
- Rechazado
- Eliminado

Acciones:
- Crear documento
- Ver historial
- Verificar seleccion, si aplica

## Tabla Registros

Debe existir tab Registros: si/no
Columnas:
- Columna 1:
- Columna 2:
- Columna 3:

Filas de ejemplo:
- Campo 1:
- Campo 2:
- Campo 3:

## Navegacion

Al abrir desde sidebar Procesos:
Al dar click al proceso:
Al crear documento:
Al abrir documento existente:
Al volver:

## Reglas especiales

- Mantener el componente y datos del proceso reutilizables.
- No hardcodear documentos dentro de `siaf-create-document`.
- Si el proceso no tiene registros, mantener el tab pero mostrar estado vacio o indicar ocultarlo.
```

## Ejemplo: documentos y registros de plan de cuentas contables

```md
## Contexto

Pantalla o flujo: Documentos y registros
Proceso: Plan de Cuentas Contables
Id del proceso: plan-cuentas-contables
Ruta del proceso: /procesos/plan-cuentas-contables
Ruta para crear solicitud: /procesos/plan-cuentas-contables/solicitud
Breadcrumb segun arbol:
- Nivel 1: Gestion contabilidad
- Nivel 2: Catalogos y clasificadores
- Nivel 3: Clasificadores
- Nivel final: Plan de Cuentas Contables
Referencia Figma: usar misma estructura de Documentos y registros hasta que se entregue diseno especifico

## Header de la pantalla

Titulo: Plan de Cuentas Contables
Subtitulo: Documentos y registros
Sistema: Sistema Nacional de Contabilidad

## Crear documento

Debe usar `siaf-create-document`: si
Documentos permitidos:
- Documento: Solicitud de Cuentas Contables
  - Ruta: /procesos/plan-cuentas-contables/solicitud
  - Tipos de accion permitidos:
    - Creacion
    - Modificacion
- Documento: Solicitud de carga masiva de plan de cuentas contables
  - Ruta: /procesos/plan-cuentas-contables/carga-masiva/solicitud
  - Tipos de accion permitidos:
    - Creacion

Reglas:
- La grilla de Documentos debe mostrar los nombres definidos en `Documentos permitidos`.
- Para `Solicitud de Cuentas Contables`, el select Tipo de accion debe mostrar Creacion y Modificacion.
- Para `Solicitud de carga masiva de plan de cuentas contables`, el select Tipo de accion debe mostrar solo Creacion.

## Tabla Documentos

Columnas:
- Documento
- Numero
- Tipo de accion
- Estado
- Sistema
- Fecha de registro
- Entidad

Filas de ejemplo:
- Documento: Solicitud de Cuentas Contables
  Numero: 0001
  Tipo de accion: Creacion
  Estado: Elaborado
  Sistema: Sistema Nacional de Contabilidad
  Fecha de registro: 20/11/2023
  Entidad: 009 - Ministerio de Economia y Finanzas
- Documento: Solicitud de carga masiva de plan de cuentas contables
  Numero: 0002
  Tipo de accion: Creacion
  Estado: Verificado
  Sistema: Sistema Nacional de Contabilidad
  Fecha de registro: 22/11/2023
  Entidad: 009 - Ministerio de Economia y Finanzas

## Tabla Registros

Debe existir tab Registros: si
Columnas:
- Estado
- Codigo de cuenta
- Nombre de cuenta
- Nivel
- Naturaleza

Filas de ejemplo:
- Estado: Activo
  Codigo de cuenta: 1101
  Nombre de cuenta: Caja y bancos
  Nivel: 2
  Naturaleza: Deudora
```

## Ejemplo: creador crea solicitud

```md
## Contexto

Pantalla o flujo: Solicitud de registro de asiento de ajuste
Rol: Creador
Estado de la solicitud: Nuevo
Proceso: Proceso de registro de asiento de ajuste
Documento: Solicitud de registro de asiento de ajuste
Tipo de accion: Creacion
Referencia Figma: pegar link del frame

## Objetivo

Armar el formulario editable para registrar una nueva solicitud.

## Header de solicitud

Titulo: Solicitud de registro de asiento de ajuste
Subtitulo / tipo de accion: Creacion
Rol del header: creator
Estado del header: new
Botones visibles: Cancelar, Grabar, Verificar
Botones ocultos: Eliminar, Editar
Boton principal: Grabar
Comportamiento al volver: regresar a documentos del proceso

## Modo de pantalla

Editable: si
Solo lectura: no
Estado visual: Nuevo
Campos bloqueados: ninguno
Campos que se pueden editar: todos los campos del formulario

## Navegacion

Al guardar: mostrar modal de confirmacion
Al aceptar modal: pasar a modo lectura elaborado y mostrar snackbar con numero de documento
```

## Ejemplo: creador edita solicitud elaborada

```md
## Contexto

Pantalla o flujo: Solicitud de registro de asiento de ajuste
Rol: Creador
Estado de la solicitud: Edicion
Proceso: Proceso de registro de asiento de ajuste
Documento: Solicitud de registro de asiento de ajuste
Tipo de accion: Creacion
Referencia Figma: pegar link del frame

## Header de solicitud

Titulo: Solicitud de registro de asiento de ajuste
Subtitulo / tipo de accion: Creacion
Rol del header: creator
Estado del header: edit
Botones visibles: Cancelar, Grabar
Botones ocultos: Eliminar, Editar, Verificar
Boton principal: Grabar

## Modo de pantalla

Editable: si
Solo lectura: no
Estado visual: Elaborado + tag Edicion
Campos bloqueados: datos de entidad y numero de documento
Campos que se pueden editar: campos de la solicitud

## Navegacion

Al guardar: confirmar cambios y volver a modo lectura elaborado
```

## Ejemplo: aprobador revisa solicitud

```md
## Contexto

Pantalla o flujo: Solicitud de registro de asiento de ajuste
Rol: Aprobador
Estado de la solicitud: Verificado
Proceso: Proceso de registro de asiento de ajuste
Documento: Solicitud de registro de asiento de ajuste
Tipo de accion: Creacion
Referencia Figma: pegar link del frame

## Header de solicitud

Titulo: Solicitud de registro de asiento de ajuste
Subtitulo / tipo de accion: Creacion
Rol del header: approver
Estado del header: verified
Botones visibles: Aprobar, Observar, Rechazar
Botones ocultos: Grabar, Editar, Eliminar, Verificar
Boton principal: Aprobar

## Modo de pantalla

Editable: no
Solo lectura: si
Estado visual: Verificado
Campos bloqueados: todos
Campos que se pueden editar: ninguno

## Modales

Modal: Confirmar aprobacion
Cuando aparece: al dar clic en Aprobar
Accion al aceptar: cambiar estado a Aprobado y mostrar snackbar

Modal: Observar solicitud
Cuando aparece: al dar clic en Observar
Campos: motivo de observacion
Accion al aceptar: cambiar estado a Observado

Modal: Rechazar solicitud
Cuando aparece: al dar clic en Rechazar
Campos: motivo de rechazo
Accion al aceptar: cambiar estado a Rechazado
```

## Checklist antes de enviarme el prompt

- Indicar rol y estado.
- Pegar link exacto de Figma si existe.
- Decir que botones deben verse.
- Decir si la pantalla es editable o solo lectura.
- Listar campos obligatorios y validaciones.
- Indicar que pasa al guardar, aceptar, editar, verificar, aprobar, observar o rechazar.
- Indicar la ruta de breadcrumbs o el arbol de procesos esperado.

## Prompt corto recomendado

Cuando ya tengamos claro el patron, puedes mandarlo asi:

```md
Rol: Creador
Estado: Elaborado
Pantalla: Solicitud de registro de asiento de ajuste
Figma: link

Necesito que esta pantalla quede en modo lectura.
Botones visibles: Eliminar, Editar, Verificar.
Al dar Editar debe pasar a estado Edicion, mantener los datos cargados y permitir modificar solo los campos del formulario.
Al Grabar debe volver a estado Elaborado y mostrar snackbar con el numero de documento.
```
