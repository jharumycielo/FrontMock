# Guía de implementación de pantallas SIAF

Este documento registra las decisiones que se van tomando al convertir los frames de Figma a Angular + Tailwind. Debe mantenerse actualizado cada vez que se ajuste un componente transversal o una regla visual.

## Objetivo

Construir pantallas como composición de componentes reutilizables. La información de cada formulario puede cambiar, pero la estructura, padding, gaps, radius, botoneras, tablas, paginación, sidebar, navbar, headers y modales deben venir del design system.

---

## Flujo de trabajo

1. Recibir el link exacto del frame o componente de Figma.
2. Obtener contexto del nodo con Figma MCP.
3. Identificar si el bloque es transversal o específico de una pantalla.
4. Decidir dónde va el componente según la regla de arquitectura:
   - **UI puro sin lógica de negocio** → `src/app/shared/ui/`
   - **Reutilizable entre features con lógica de negocio** → `src/app/shared/components/`
   - **Exclusivo del shell** → `src/app/layout/`
   - **Específico de un feature** → `src/app/features/[feature]/components/`
5. Usar tokens CSS ya existentes antes de hardcodear valores.
6. Validar con `npm run build`.
7. Levantar o refrescar el servidor local con `npm start`.
8. Actualizar este documento cuando haya una nueva regla.

---

## Regla de arquitectura de componentes

| Carpeta | Criterio | Ejemplos |
|---|---|---|
| `shared/ui/` | 100% presentacional, sin HTTP ni lógica SIAF. Reutilizable en cualquier sistema. | `siaf-button`, `siaf-alert`, `siaf-input`, `siaf-badge` |
| `shared/components/` | Tiene lógica de negocio pero se usa en ≥ 2 features | `siaf-solicitude-header`, `siaf-pagination`, `siaf-data-table` |
| `layout/` | Usado únicamente por `AppShellComponent` | `siaf-navbar`, `siaf-sidebar`, `siaf-create-document` |
| `features/X/components/` | Específico de un solo feature | Componentes propios de `adjustment-seat` o `chart-accounts` |

**Los features no se importan entre sí.** Si algo se necesita en dos features, sube a `shared/components/`.

---

## Componentes disponibles por capa

### `shared/ui/` — UI Kit puro

**Formularios:**
- `siaf-input` (`TextFieldComponent`) — campo unificado. Tipos: `text`, `number`, `email`, `password`, `select`, `select-multiple`. Props: `label`, `error`, `hint`, `state`, `leadingIcon`, `trailingIcon`, `disabled`.
- `siaf-date-time-picker` — fechas y fechas+hora. Variantes: `date`, `datetime`. **No usar `siaf-input` para fechas.**
- `siaf-button` — variantes: `primary`, `secondary`, `ghost`, `danger`, `accent`. Tamaños: `sm`, `md`, `lg`.
- `siaf-checkbox`, `siaf-radio-group`, `siaf-switch`, `siaf-uploader`, `text-area-control`

**Retroalimentación:**
- `siaf-alert` — alert inline. Tonos: `neutral`, `info`, `success`, `warning`, `error`. Props: `title`, `description`, `showClose`.
- `siaf-snackbar` — notificación temporal flotante.
- `siaf-modal` — diálogo modal con variantes predefinidas.

**Visualización:**
- `siaf-badge`, `siaf-tag`, `siaf-flow-status-tag`, `siaf-icon`, `siaf-tabs`, `siaf-accordion`, `siaf-steps`

### `shared/components/` — Transversales de negocio

- `siaf-breadcrumb` — ruta de navegación.
- `siaf-pagination` — paginación con selector de filas (10/25/50/100).
- `siaf-data-table` — tabla con columnas configurables.
- `siaf-timeline` — línea de tiempo con estados.
- `siaf-custom-filter` — filtros dinámicos campo/condición/valor.
- `siaf-solicitude-page-layout` — layout transversal de pantallas de solicitud.
- `siaf-solicitude-form-card` — card de sección del formulario.
- `siaf-solicitude-info-card` — card de datos generales de solicitud.
- `siaf-solicitude-header` — cabecera con matriz `role` + `state`.

### `layout/` — Exclusivos del shell

- `siaf-navbar`, `siaf-sidebar`, `siaf-side-panel`
- `siaf-process-menu-tree` — árbol flotante de procesos.
- `siaf-create-document` — panel flotante de creación de documentos.
- `siaf-tray-menu`, `siaf-tray-documents-view` — bandeja de documentos.
- `siaf-mobile-navigation-menu` — menú móvil.

---

## Tokens de color

Los colores del proyecto salen de los tokens exportados desde Figma.

El build de tokens genera:
- `--figma-light-sys-color-*` — valor directo desde Figma.
- `--sys-color-*` — alias semántico que consumen los componentes.

**Regla:** usar siempre tokens semánticos, nunca hex directos en `src/app/`.

```css
/* Usar */
background: var(--sys-color-bg-feedback-light-info);
color: var(--sys-color-text-feedback-danger);

/* No usar */
background: #B0DEFD;
color: #821C1E;
```

---

## Inputs y formularios

### Campo de texto — `siaf-input`

```html
<siaf-input label="Código *" type="text" />
<siaf-input label="Contraseña" type="password" />
<siaf-input label="Tipo" type="select" [options]="options" />
<siaf-input label="Estado" error="Campo requerido" />
<siaf-input label="Válido" state="success" />
<siaf-input label="Deshabilitado" [disabled]="true" />
```

Tipos disponibles: `text`, `number`, `email`, `password`, `select`, `select-multiple`.

### Fecha — `siaf-date-time-picker`

```html
<siaf-date-time-picker label="Fecha inicio" variant="date" />
<siaf-date-time-picker label="Fecha y hora" variant="datetime" />
```

### Alerts en formularios

Patrón estándar para validación de campos:

```html
@if (selectedPlan()) {
  @if (validationState() === 'idle') {
    <siaf-alert tone="info" title="Instrucción" description="Ingrese el valor para continuar." />
  } @else if (validationState() === 'error') {
    <siaf-alert tone="error" title="Valor ya registrado" description="Ingrese un valor diferente." />
  } @else if (validationState() === 'valid') {
    <siaf-alert tone="success" title="Validación exitosa" description="El valor está disponible." />
  }
}
```

Los íconos del alert usan `variant="filled"` (relleno sólido).

---

## Select inputs

Los campos tipo select no deben mostrar el menú nativo del navegador.

- `siaf-input` con `type="select"` o `type="select-multiple"` usa `siaf-select-options` internamente.
- El menú sigue Figma: superficie `--sys-color-bg-surfaces-surface-highest`, radio `8px`.
- Cada opción tiene mínimo `48px`, padding horizontal `16px`.

---

## Date picker

- Usar `siaf-date-time-picker`, nunca inputs nativos aislados.
- Variante `date` para solo fecha; `datetime` para fecha y hora.
- El popup usa `--sys-color-bg-surfaces-surface`, radio `8px`.
- Día seleccionado: `--sys-color-bg-brand-primary`.

---

## Íconos

- Usar `material-icons` instalado por npm, nunca CDN.
- Siempre consumir mediante `siaf-icon`.
- El default del `siaf-icon` es `variant="outlined"`.
- Para íconos con relleno sólido usar `variant="filled"`.
- Si Figma usa un nombre no disponible, agregar alias en `icon.component.ts`.

Fuentes cargadas en `styles.css`:
```css
@import "material-icons/iconfont/material-icons.css";      /* filled */
@import "material-icons/iconfont/outlined.css";             /* outlined */
```

---

## Reglas de layout

- El navbar va arriba y ocupa el ancho completo de la pantalla.
- El layout con sidebar comienza debajo del navbar.
- El sidebar tiene ancho fijo de `64px`.
- El contenido principal usa `lg:pl-16` para respetar el espacio del sidebar.
- Los formularios deben ser responsive.
- No duplicar componentes transversales dentro de una pantalla.

### Sidebar

```html
<siaf-sidebar
  [navigation]="activeNavigation"
  (created)="openSidebarCreateDocument()"
  (navigationChanged)="onNavigationChange($event)"
/>

@if (processMenuOpen) {
  <siaf-process-menu-tree (nodeSelected)="onProcessNodeSelected($event)" />
}

@if (sidebarCreateDocumentOpen) {
  <siaf-create-document />
}
```

El `+` del sidebar abre `siaf-create-document`. El botón `Procesos` abre `siaf-process-menu-tree`. Click fuera cierra cualquier flotante.

---

## Solicitud — layout transversal

```html
<siaf-solicitude-page-layout
  [breadcrumbs]="breadcrumbs"
  role="creator"
  state="new"
  heading="Nombre de la solicitud"
  secondaryText="Creación"
  [showReturn]="true"
  (returned)="goBack()"
  (canceled)="goBack()"
>
  <siaf-solicitude-info-card [fields]="entityFields" [liveDate]="true" />

  <siaf-solicitude-form-card title="Sección del formulario">
    <!-- campos aquí -->
  </siaf-solicitude-form-card>
</siaf-solicitude-page-layout>
```

### Header de solicitud — roles y estados

| Rol | Valor |
|---|---|
| Creador | `creator` |
| Revisor | `reviewer` |
| Aprobador | `approver` |

Estados: `new`, `edit`, `readonly`, `elaborated`, `registered`, `verified`, `validated`, `reviewed`, `generated`, `in_process`, `authorized`, `signed`, `approved`, `accepted`, `published`, `processed`, `observed`, `pending`, `failed`, `deleted`, `rejected`, `annulled`.

---

## Estados oficiales del documento — `siaf-flow-status-tag`

```html
<siaf-flow-status-tag status="Elaborado" size="standard" />
```

| Tono | Estados |
|---|---|
| Default | Elaborado, Registrado |
| Info | Verificado, Validado, Revisado, Generado, En proceso |
| Success | Autorizado, Firmado, Aprobado, Aceptado, Publicado, Procesado |
| Warning | Observado, Pendiente, Fallido |
| Danger | Eliminado, Rechazado, Anulado |

---

## Paginación

```html
<siaf-pagination
  navigation="Activate"
  position="Bottom"
  [rowPage]="true"
  [page]="page"
  [pageSize]="rowsPerPage"
  [totalItems]="totalItems"
  [totalPages]="totalPages"
  [rowsPerPageOptions]="[10, 25, 50, 100]"
  (rowsPerPageChange)="onRowsPerPageChange($event)"
/>
```

Al cambiar filas por página, regresar a `page = 1`.

---

## Validaciones antes de cerrar una pantalla

- `npm run build` sin errores.
- Los componentes transversales no están duplicados dentro de la pantalla.
- No hay hex directos en el template ni en el TS del componente.
- Navbar, sidebar, breadcrumb y paginación mantienen sus medidas.
- La data dinámica no está hardcodeada.
- Responsive revisado en mobile y desktop.

---

## Cómo actualizar esta guía

Cada vez que se corrija un componente transversal:

1. Agregar la regla en la sección correspondiente.
2. Indicar si aplica a todas las pantallas o solo a una feature.
3. Si hay valores CSS exactos desde Figma, pegarlos aquí.
4. Si cambia el API del componente, agregar un ejemplo de uso actualizado.
