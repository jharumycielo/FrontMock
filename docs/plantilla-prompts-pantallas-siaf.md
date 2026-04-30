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
| Header solicitud | `siaf-solicitude-header` | Encabezado de formularios de solicitud. |
| Tag de estado de flujo | `siaf-flow-status-tag` | Estado visual del documento usando colores del UI Kit. |
| Crear documento | `siaf-create-document` | Panel lateral desde el boton Crear. |
| Arbol procesos | `siaf-process-menu-tree` | Menu de procesos desde el sidebar. |
| Date picker | `siaf-date-time-picker` | Campos de fecha o fecha/hora. |
| Boton | `siaf-button` | Acciones con iconos y variantes del sistema. |
| Modal | `siaf-modal` | Confirmaciones y decisiones bloqueantes. |
| Snackbar | `siaf-snackbar` | Confirmaciones no bloqueantes. |
| Paginacion | `siaf-pagination` | Tablas con resultados. |

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
