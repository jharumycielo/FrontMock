# Guia de implementacion de pantallas SIAF

Este documento registra las reglas actuales para construir pantallas SIAF con Angular, Tailwind y el sistema de diseno del proyecto. Debe actualizarse cuando cambie un componente transversal, una regla visual o un flujo reutilizable.

## Objetivo

Construir pantallas como composicion de componentes reutilizables. La informacion de cada formulario puede variar, pero estructura, paddings, gaps, radius, botoneras, tablas, filtros, paginacion, sidebar, navbar, headers, modales, elevaciones y estados deben venir del design system.

## Flujo de trabajo

1. Recibir el link exacto del frame o componente de Figma cuando exista.
2. Identificar si el bloque es transversal o especifico de una pantalla.
3. Decidir la capa correcta del componente.
4. Usar tokens CSS y clases del sistema antes de crear estilos nuevos.
5. Implementar con componentes existentes cuando aplique.
6. Validar con `npm run typecheck`.
7. Actualizar esta guia si aparece una regla nueva.

## Capas

| Carpeta | Criterio | Ejemplos |
| --- | --- | --- |
| `shared/ui/` | UI puro, sin logica SIAF. | `siaf-button`, `siaf-input`, `readonly-field`, `siaf-flow-status-tag` |
| `shared/components/` | Reutilizable entre features con logica de negocio. | `siaf-custom-filter`, `siaf-table-controls`, `siaf-pagination` |
| `layout/` | Exclusivo del shell. | `siaf-navbar`, `siaf-sidebar`, `siaf-create-document` |
| `features/[feature]/components/` | Especifico de un proceso. | Componentes internos de `chart-accounts` |
| `features/[feature]/pages/[page]/` | Pantallas del proceso. | `request`, `documents`, `form` |

Reglas:

- Los features no se importan entre si.
- Si algo se necesita en dos features, subir a `shared/components/`.
- `shared/ui/` nunca importa de `shared/components/`, `layout/` ni `features/`.

## Tokens y estilos

Los colores, elevaciones, radios, bordes y estados deben salir de tokens.

Reglas:

- No usar hexadecimales hardcodeados en `src/app/`.
- No usar `box-shadow` hardcodeado en componentes.
- Usar tokens semanticos `--sys-color-*` para colores.
- Usar tokens de efectos `--sys-effects-*` o clases `shadow-siaf-*` para elevaciones.
- Required `*` debe salir de la propiedad `[required]="true"` del componente, no escribirse manualmente.
- El color del `*` debe usar `--sys-color-text-feedback-danger`.

Ejemplo:

```css
/* Correcto */
color: var(--sys-color-text-feedback-danger);
box-shadow: var(--sys-effects-elevation-e0) var(--sys-effects-elevation-e1) var(--sys-effects-blur-b3) 0 rgba(0, 0, 0, 0.14);

/* Evitar */
color: #821C1E;
box-shadow: 0 8px 10px rgba(0, 0, 0, 0.14);
```

## Componentes disponibles

### UI Kit

| Componente | Uso |
| --- | --- |
| `siaf-input` | Texto, password, number, select y select multiple. |
| `text-area-control` | Textarea con required, contador y estados. |
| `readonly-field` | Campo de solo lectura para cualquier valor del formulario. |
| `siaf-button` | Acciones del sistema. |
| `siaf-alert` | Validaciones inline. |
| `siaf-modal` | Confirmaciones bloqueantes. |
| `siaf-snackbar` | Confirmaciones no bloqueantes. |
| `siaf-flow-status-tag` | Estado visual de documentos y registros. |
| `siaf-upload-side-panel` | Carga de documentos. |
| `siaf-uploaded-file-card` | Archivo cargado. |

### Componentes transversales

| Componente | Uso |
| --- | --- |
| `siaf-breadcrumb` | Ruta de navegacion. |
| `siaf-custom-filter` | Filtros dinamicos campo/condicion/valor. |
| `siaf-table-controls` | Checkbox maestro, acciones y paginacion de tablas. |
| `siaf-pagination` | Paginacion superior/inferior. |
| `siaf-data-table` | Tabla configurable. |
| `siaf-solicitude-page-layout` | Layout de solicitudes. |
| `siaf-solicitude-form-card` | Card de formulario. |
| `siaf-solicitude-info-card` | Datos generales de solicitud. |
| `siaf-solicitude-header` | Cabecera por rol y estado. |

## Inputs y formularios

### `siaf-input`

```html
<siaf-input label="Codigo" [required]="true" />
<siaf-input label="Estado" type="select" [options]="statusOptions" />
<siaf-input label="Ambito" type="select-multiple" [options]="scopeOptions" />
<siaf-input label="Nombre" state="success" />
```

Reglas:

- Usar `[required]="true"` para mostrar el `*`.
- Usar `state="success"` cuando el valor ingresado ya cumple la validacion.
- Usar `[clearable]="true"` cuando el campo no sea obligatorio y pueda quedar vacio.
- Select y select multiple deben usar el dropdown del sistema, no el nativo del navegador.

### `text-area-control`

```html
<text-area-control
  placeholder="Justificacion del requerimiento solicitado"
  [required]="true"
  [maxlength]="500"
  [value]="justification()"
  (valueChange)="justification.set($event)"
/>
```

Reglas:

- Debe soportar required, success, disabled y contador.
- En modo lectura se reemplaza por `readonly-field`.

## Modo lectura

Toda pantalla en modo lectura debe usar `readonly-field` para representar valores.

Reglas:

- Inputs de texto: `readonly-field` con el valor.
- Select: `readonly-field` con el label de la opcion.
- Select multiple: `readonly-field` con labels separados por coma.
- Radio button: `readonly-field` con `Si`, `No` o `--`.
- Checkbox: `readonly-field` con `Si` o `No`.
- Textarea: `readonly-field` con el contenido.
- Botones de accion contextual: ocultar, no solo deshabilitar.
- Tablas de detalle: ocultar checkboxes y acciones en lectura.

Ejemplo:

```html
@if (isReadOnly) {
  <readonly-field caption="Naturaleza" [required]="true" [value]="optionLabel(natureOptions, accountNature())" />
  <readonly-field caption="Ambito institucional" [value]="optionLabels(scopeOptions, scope())" />
  <readonly-field caption="Tiene dinamica contable" [value]="yesNoLabel(hasDynamics())" />
} @else {
  <siaf-input label="Naturaleza" type="select" [required]="true" [options]="natureOptions" />
}
```

## Filtros personalizados

`siaf-custom-filter` es el componente global para agregar filtros personalizados.

Reglas:

- Debe ser responsive en mobile, tablet y desktop.
- En desktop/tablet, los dropdowns deben abrirse sin romper el layout ni superponerse visualmente.
- Botones Cancelar y Aplicar deben alinearse horizontalmente cuando el ancho lo permite.
- La elevacion debe salir de tokens o clases del sistema.
- Debe aplicarse en Documentos y registros, Bandeja y cualquier tabla que requiera filtros dinamicos.

## Tablas

### Controles de tabla

Usar `siaf-table-controls` cuando una tabla tenga seleccion, acciones o paginacion.

Reglas:

- El checkbox maestro va alineado con los checkboxes de la tabla.
- Las acciones de editar, eliminar y menu se ocultan hasta que exista seleccion.
- Si hay seleccion parcial, el checkbox maestro muestra indeterminate.
- La paginacion puede ir arriba y abajo segun la variante del flujo.
- En modo lectura se ocultan checkboxes y acciones.

### Documentos y registros

Reglas:

- Los checkboxes usan tokens de color:
  - Enabled: `--sys-color-icon-states-enabled`.
  - Disabled: `--sys-color-icon-states-disabled`.
  - Active: `--sys-color-icon-states-active`.
- La verificacion multiple solo aplica a documentos en estado `Elaborado`.
- Los documentos `Verificado` deben tener checkbox deshabilitado.
- Los filtros deben aplicar en Documentos, Registros y Bandeja.

## Estados oficiales

Usar `siaf-flow-status-tag` para estados de documentos y registros.

| Tono | Estados |
| --- | --- |
| Default | Elaborado, Registrado |
| Info | Verificado, Validado, Revisado, Generado, En proceso |
| Success | Autorizado, Firmado, Aprobado, Aceptado, Publicado, Procesado |
| Warning | Observado, Pendiente, Fallido |
| Danger | Eliminado, Rechazado, Anulado |

## Solicitudes

Toda solicitud debe usar:

```html
<siaf-solicitude-page-layout
  [breadcrumbs]="breadcrumbs"
  role="creator"
  [state]="solicitudeHeaderState"
  heading="Solicitud de cuentas contables"
  secondaryText="Creacion"
>
  <siaf-solicitude-info-card [fields]="entityFields" />
  <siaf-solicitude-form-card title="Seccion del formulario">
    <!-- contenido -->
  </siaf-solicitude-form-card>
</siaf-solicitude-page-layout>
```

Reglas:

- En estado `new`, la solicitud es editable.
- Al grabar correctamente, pasa a `elaborated` y modo lectura.
- En `elaborated`, las acciones de modificacion solo aparecen al presionar Editar.
- En modo lectura, el usuario puede revisar informacion sin modificarla.

## Solicitud de cuentas contables

Reglas actuales:

- El formulario de cuenta se abre con el boton `+`.
- El boton Aceptar se habilita solo cuando el formulario cumple sus casuisticas.
- Al aceptar, la cuenta se agrega a la tabla de `Lista de cuentas contables`.
- Al editar una cuenta creada, se recuperan los datos originales.
- En modo lectura, hacer click en una fila abre el detalle en modo lectura.
- Los botones editar/eliminar y checkboxes se ocultan en modo lectura.
- `Vigencia`, `Visible` y `Tiene dinamica contable` tienen reglas automaticas.
- Si `Es una cuenta imputable` es `No`, `Tiene dinamica contable` se marca `No` y sus controles quedan bloqueados.

Codigo contable:

- El punto `.` separa niveles.
- Se aceptan de 1 a 7 segmentos.
- Primer segmento: 1 digito.
- Segmentos siguientes: 1 o 2 digitos.
- `1`, `1.1`, `1.22.31.1` son validos.
- `1101` es invalido porque no usa separadores.

## Validaciones antes de cerrar una pantalla

- `npm run typecheck` sin errores.
- No hay hex directos ni sombras hardcodeadas en componentes.
- No hay componentes transversales duplicados dentro de una pantalla.
- Los campos required usan `[required]="true"`.
- El modo lectura usa `readonly-field`.
- Los controles de accion se ocultan cuando no corresponden.
- La tabla mantiene paginacion, seleccion e indeterminate.
- Responsive revisado en mobile, tablet y desktop.
