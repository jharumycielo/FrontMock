# Plantilla de prompts para pantallas SIAF

Esta guia sirve para pedir nuevas pantallas o modificar flujos como piezas reutilizables. El prompt debe indicar rol, estado, estructura visual, formulario, acciones, reglas de lectura y comportamiento esperado.

## Prompt base

```md
## Contexto

Pantalla o flujo:
Proceso:
Documento:
Ruta:
Rol:
Estado del documento:
Estado del header:
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

En mobile:
- Mostrar ultimo nivel:
- El resto debe ir dentro de "...":

## Modo de pantalla

Editable:
Solo lectura:
Estado visual:
Campos bloqueados:
Campos que se pueden editar:

Reglas de solo lectura:
- Inputs:
- Selects:
- Select multiple:
- Radio buttons:
- Checkboxes:
- Textareas:
- Botones que se ocultan:
- Tablas que ocultan checkboxes/acciones:

## Formulario

Secciones:
- Nombre de seccion:
  - Campos:
  - Obligatorios:
  - Validaciones:
  - Componentes esperados:
  - Comportamiento en modo lectura:

## Tablas

Tabla:
Columnas:
Acciones por fila:
Acciones por seleccion:
Estados posibles:
Paginacion superior:
Paginacion inferior:
Filtros:
Checkbox maestro:
Regla de indeterminate:
Regla de seleccion por estado:

## Modales

Modal:
Cuando aparece:
Titulo:
Mensaje:
Botones:
Accion al aceptar:
Accion al cancelar:

## Alert inline

Cuando aparece:
Estado idle:
Estado error:
Estado success:
Campo que dispara la validacion:

## Snackbar

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

| Rol en prompt | Valor en codigo | Uso esperado |
| --- | --- | --- |
| Creador | `creator` | Crea, guarda, edita y verifica segun el flujo. |
| Revisor | `reviewer` | Revisa informacion y puede observar o derivar. |
| Aprobador | `approver` | Aprueba, observa o rechaza. |

## Estados del documento

| Estado en prompt | Valor sugerido | Tono |
| --- | --- | --- |
| Elaborado | `elaborated` | Default |
| Registrado | `registered` | Default |
| Verificado | `verified` | Info |
| Validado | `validated` | Info |
| Revisado | `reviewed` | Info |
| Generado | `generated` | Info |
| En proceso | `in_process` | Info |
| Autorizado | `authorized` | Success |
| Firmado | `signed` | Success |
| Aprobado | `approved` | Success |
| Aceptado | `accepted` | Success |
| Publicado | `published` | Success |
| Procesado | `processed` | Success |
| Observado | `observed` | Warning |
| Pendiente | `pending` | Warning |
| Fallido | `failed` | Warning |
| Eliminado | `deleted` | Danger |
| Rechazado | `rejected` | Danger |
| Anulado | `annulled` | Danger |

## Estados del header

| Estado del header | Valor en codigo | Comportamiento |
| --- | --- | --- |
| Nuevo | `new` | Formulario editable y acciones de creacion. |
| Edicion | `edit` | Formulario editable con datos existentes. |
| Solo lectura | `readonly` | Pantalla bloqueada sin estado de negocio especifico. |
| Elaborado | `elaborated` | Modo lectura; puede permitir Editar o Verificar segun rol. |
| Verificado | `verified` | Modo lectura para roles posteriores. |
| Aprobado | `approved` | Modo lectura de cierre positivo. |
| Observado | `observed` | Lectura o edicion condicionada. |
| Rechazado | `rejected` | Modo lectura de cierre negativo. |

## Componentes reutilizables

| Pieza | Componente sugerido | Capa |
| --- | --- | --- |
| Navbar | `siaf-navbar` | `layout/` |
| Sidebar | `siaf-sidebar` | `layout/` |
| Crear documento | `siaf-create-document` | `layout/` |
| Bandeja | `siaf-tray-documents-view` | `layout/` |
| Breadcrumb | `siaf-breadcrumb` | `shared/components/` |
| Layout solicitud | `siaf-solicitude-page-layout` | `shared/components/` |
| Card de formulario | `siaf-solicitude-form-card` | `shared/components/` |
| Card de datos | `siaf-solicitude-info-card` | `shared/components/` |
| Header solicitud | `siaf-solicitude-header` | `shared/components/` |
| Filtros dinamicos | `siaf-custom-filter` | `shared/components/` |
| Controles de tabla | `siaf-table-controls` | `shared/components/` |
| Paginacion | `siaf-pagination` | `shared/components/` |
| Campo de texto/select | `siaf-input` | `shared/ui/` |
| Textarea | `text-area-control` | `shared/ui/` |
| Campo readonly | `readonly-field` | `shared/ui/` |
| Boton | `siaf-button` | `shared/ui/` |
| Alert inline | `siaf-alert` | `shared/ui/` |
| Modal | `siaf-modal` | `shared/ui/` |
| Snackbar | `siaf-snackbar` | `shared/ui/` |
| Estado de flujo | `siaf-flow-status-tag` | `shared/ui/` |
| Upload | `siaf-upload-side-nav` | `shared/ui/` |

## Reglas de modo lectura

Cuando una solicitud entra en modo lectura:

- Usar `readonly-field` para inputs, selects, select multiple, radios, checkboxes y textareas.
- Select multiple debe mostrar labels separados por coma.
- Radio y checkbox deben mostrar `Si`, `No` o `--`.
- Ocultar botones de busqueda, carga, edicion y eliminacion que sean acciones de modificacion.
- No dejar botones de accion solo deshabilitados si el usuario no debe usarlos.
- En tablas de detalle, ocultar checkboxes y acciones.
- El click de fila puede abrir detalle en modo lectura.

## Reglas para tablas

- Usar `siaf-table-controls` si hay seleccion o acciones masivas.
- Mostrar editar/eliminar/menu solo cuando exista seleccion.
- Usar indeterminate en checkbox maestro cuando hay seleccion parcial.
- La seleccion por estado debe definirse explicitamente.
- En documentos, la verificacion multiple solo aplica a `Elaborado`.
- `Verificado` debe quedar deshabilitado para esa seleccion.

## Prompt corto: modo lectura

```md
Pantalla: Solicitud de cuentas contables
Estado del header: Elaborado
Modo: Solo lectura

Aplicar readonly-field a todos los campos del formulario:
- Inputs y selects con su label visible.
- Select multiple separado por coma.
- Radios y checkboxes como Si/No.
- Textareas como readonly-field.

Ocultar:
- Botones de busqueda.
- Botones de upload.
- Checkboxes y acciones de tablas.
```

## Prompt corto: tabla con seleccion

```md
Pantalla: Documentos y registros
Tabla: Documentos

Agregar controles de tabla con:
- Checkbox maestro alineado a la tabla.
- Indeterminate con seleccion parcial.
- Acciones ocultas hasta seleccionar.
- Seleccion permitida solo para documentos en estado Elaborado.
- Documentos Verificado con checkbox deshabilitado.
- Paginacion superior e inferior.
```

## Prompt corto: solicitud de cuentas contables

```md
Pantalla: Solicitud de Cuentas Contables
Rol: Creador
Estado: Nuevo

Necesito crear cuentas contables desde el boton +.
Al aceptar una cuenta valida, agregarla a la tabla Lista de cuentas contables.
Al editar una cuenta, recuperar todos los datos originales.
Al grabar la solicitud completa, pasar a estado Elaborado y modo lectura.

Codigo contable:
- Usar punto como separador.
- Primer segmento de 1 digito.
- Segmentos siguientes de 1 o 2 digitos.
- Permitir crear solo el primer segmento.
- Rechazar codigo existente.
```

## Checklist antes de enviar un prompt

- Indicar rol y estado.
- Indicar si la pantalla es editable o solo lectura.
- Listar campos obligatorios.
- Indicar validaciones y casuisticas.
- Decir que botones se ven y cuales se ocultan.
- Indicar comportamiento de tablas, filtros y paginacion.
- Indicar que pasa al guardar, editar, verificar, aprobar, observar o rechazar.
- Pegar link exacto de Figma si existe.
