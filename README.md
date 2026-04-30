# SIAF-RP — Sistema Integrado de Administración Financiera de los Recursos Públicos

Aplicación web para la gestión de procesos financieros y contables del Estado Peruano. Construida con Angular 20 y Tailwind CSS 4, implementa un sistema de diseño propio basado en tokens de Figma.

---

## Tecnologías

| Herramienta | Versión |
|---|---|
| Angular | 20.3.19 |
| Tailwind CSS | 4.1.17 |
| TypeScript | 5.9.3 |
| RxJS | 7.8.2 |
| Material Icons | 1.13.14 |
| Zone.js | 0.15.0 |
| Node.js requerido | ≥ 20.19.0 < 21 |
| NPM requerido | ≥ 10 |

---

## Instalación y desarrollo

```bash
nvm use
npm install
npm start          # http://localhost:4200
npm run build      # Build de producción
```

> El proyecto fija Node.js en `.nvmrc` para mantener builds reproducibles con Angular/esbuild.

---

## Estructura del proyecto

```
src/
├── app/
│   ├── features/          # Páginas y flujos de la aplicación
│   ├── shared/
│   │   ├── ui/            # Librería de componentes base (~45 componentes)
│   │   └── components/    # Componentes transversales de negocio
│   ├── layout/            # Navbar, Sidebar, SidePanel
│   ├── app.routes.ts      # Definición de rutas
│   └── app.component.html # Router outlet raíz
├── assets/
│   └── figma/             # Assets exportados desde Figma
└── styles/
    └── tokens/            # Variables CSS del sistema de diseño
```

---

## Rutas

```
/                                              → redirige a /login
/login                                         → Pantalla de inicio de sesión
/login/recuperar-contrasena                    → Verificación de código OTP
/panel                                         → Escritorio virtual (dashboard)
/procesos/registro-asiento-ajuste              → Documentos y registros
/procesos/registro-asiento-ajuste/solicitud    → Solicitud de asiento de ajuste
/procesos/registro-asiento-ajuste/formulario   → Formulario de asiento de ajuste
```

---

## Páginas

### `/login` — Inicio de sesión
Autenticación con dos modalidades mediante tabs:

- **Entidades del Estado** — Formulario usuario/contraseña con etiquetas flotantes, toggle de visibilidad y navegación a recuperación de contraseña.
- **Proveedores y Externos** — Acceso mediante proveedores de identidad externos: **ID Peru**, **SUNAT** y **JNE** (con popover informativo).

### `/login/recuperar-contrasena` — Verificación OTP
Ingreso del código de 4 dígitos enviado al correo. Auto-avance entre campos, soporte de pegado, botón habilitado al completar todos los dígitos.

### `/panel` — Escritorio virtual
Dashboard principal con acceso directo a todos los módulos del sistema mediante tarjetas: Bandeja, Procesos, Recibidos, Enviados, Borradores, Notificaciones, Consulta/Reportes y Crear documento.

### `/procesos/registro-asiento-ajuste` — Documentos y registros
Gestión completa de asientos de ajuste contable con dos tabs:

- **Documentos** — Tabla con columnas: Documento, Número, Tipo de acción, Estado, Sistema, Fecha, Entidad. Acciones: verificar selección, ver historial, crear documento.
- **Registros** — Tabla con columnas: Estado, Doc. contable, Ámbito institucional, Código clase ajuste, Código detalle ajuste, Total débito, Total crédito.

Funcionalidades: búsqueda, filtros predefinidos, filtros personalizados dinámicos, paginación configurable (10/25/50/100), selección múltiple, modal de confirmación y snackbar de resultado.

---

## Librería de componentes UI (`shared/ui`)

Todos los componentes usan el selector prefix `siaf-` y `ChangeDetectionStrategy.OnPush`.

### Formularios

| Componente | Selector | Descripción |
|---|---|---|
| ButtonComponent | `siaf-button` | Variantes: `primary`, `secondary`, `ghost`, `danger`, `accent`. Tamaños: `sm`, `md`, `lg`. Soporte de ícono y estado de carga. |
| TextFieldComponent | `siaf-text-field` | Input con etiqueta flotante. Tipos: `text`, `number`, `email`, `select`, `select-multiple`. Estados: enabled, error, success. |
| CheckboxComponent | `siaf-checkbox` | Casilla de verificación con label. |
| RadioComponent | `siaf-radio` | Botón de opción. |
| SwitchComponent | `siaf-switch` | Toggle on/off. |
| SelectOptionsComponent | `siaf-select-options` | Listado de opciones para selects, soporta selección múltiple. |
| DateTimePickerComponent | `siaf-date-time-picker` | Selector de fecha y hora. |
| UploaderComponent | `siaf-uploader` | Carga de archivos con drag & drop. |

### Retroalimentación

| Componente | Selector | Descripción |
|---|---|---|
| SnackbarComponent | `siaf-snackbar` | Notificación temporal en la parte inferior. |
| AlertComponent | `siaf-alert` | Mensaje de alerta contextual (info, success, warning, error). |
| LoadingProgressComponent | `siaf-loading-progress` | Indicador de carga. |
| ModalComponent | `siaf-modal` | Diálogo modal con variantes predefinidas: delete-request, review, verify, approve, cancel, etc. |
| TooltipComponent | `siaf-tooltip` | Tooltip sobre elementos. |
| PopoverComponent | `siaf-popover` | Popover con contenido enriquecido. |

### Datos y visualización

| Componente | Selector | Descripción |
|---|---|---|
| DataTableComponent | `siaf-data-table` | Tabla con columnas configurables. |
| TimelineComponent | `siaf-timeline` | Línea de tiempo con estados: done, current, pending, error. |
| ActionTrackerComponent | `siaf-action-tracker` | Rastreador de acciones con variantes `default` y `detail`. |
| ListComponent | `siaf-list` | Lista de ítems. |
| TreeViewComponent | `siaf-tree-view` | Vista de árbol jerárquico. |
| BadgeComponent | `siaf-badge` | Indicador de conteo o estado. |
| TagComponent | `siaf-tag` | Etiqueta de categoría. |
| ReadonlyComponent | `siaf-readonly` | Campo de solo lectura. |

### Navegación

| Componente | Selector | Descripción |
|---|---|---|
| IconComponent | `siaf-icon` | Ícono de Material Icons. Variantes: filled, outlined, round, sharp, two-tone. |
| TabsComponent | `siaf-tabs` | Navegación por pestañas. |
| AccordionComponent | `siaf-accordion` | Panel expandible/colapsable. |
| StepsComponent | `siaf-steps` | Indicador de pasos de un flujo. |
| StepperCardComponent | `siaf-stepper-card` | Tarjeta de paso de proceso. |

### Específicos del dominio

| Componente | Selector | Descripción |
|---|---|---|
| CreateDocumentComponent | `siaf-create-document` | Panel/dropdown para crear documentos con campos configurables. |
| DocumentHistoryPanelComponent | `siaf-document-history-panel` | Panel lateral con historial de cambios de un documento. |
| AnnulmentModalComponent | `siaf-annulment-modal` | Modal especializado para anulación de documentos. |
| ProcessMenuTreeComponent | `siaf-process-menu-tree` | Árbol de navegación de procesos del sistema. |
| SolicitudeHeaderComponent | `siaf-solicitude-header` | Cabecera de una solicitud con datos de identificación. |
| SummaryCardComponent | `siaf-summary-card` | Tarjeta resumen de estado de proceso. |
| TrayMenuComponent | `siaf-tray-menu` | Menú lateral de bandeja de documentos. |
| TrayDocumentsViewComponent | `siaf-tray-documents-view` | Vista de documentos de una bandeja seleccionada. |
| MobileNavigationMenuComponent | `siaf-mobile-navigation-menu` | Menú de navegación para pantallas móviles. |

---

## Componentes transversales (`shared/components`)

Combinan múltiples componentes base para casos de uso recurrentes entre features.

| Componente | Selector | Descripción |
|---|---|---|
| PaginationComponent | `siaf-pagination` | Paginación con posición `Top`/`Bottom`, selector de filas por página. |
| BreadcrumbComponent | `siaf-breadcrumb` | Ruta de navegación con ítems clicables. |
| DataTableComponent | `siaf-data-table` | Tabla con columnas y filas configurables. |
| AlertComponent | `siaf-alert` | Alerta transversal. |
| SnackbarComponent | `siaf-snackbar` | Notificación transversal. |
| TimelineComponent | `siaf-timeline` | Línea de tiempo transversal. |
| LoadingProgressComponent | `siaf-loading-progress` | Progreso de carga transversal. |
| ActionTrackerComponent | `siaf-action-tracker` | Rastreador de acciones transversal. |
| CustomFilterComponent | `siaf-custom-filter` | Panel de filtros personalizados dinámicos con campos Campo / Condición / Valor. Soporta múltiples condiciones, eliminación por fila y carga de valores iniciales. |

---

## Layout (`layout/`)

| Componente | Selector | Descripción |
|---|---|---|
| NavbarComponent | `siaf-navbar` | Barra superior con logo, usuario, oficina, notificaciones y perfil. Props: `userName`, `officeName`, `showMenu`, `showNotifications`, `showProfile`. |
| SidebarComponent | `siaf-sidebar` | Navegación lateral. Variantes `rail` y `expanded`. Emite eventos de navegación y creación. |
| SidePanelComponent | `siaf-side-panel` | Panel lateral auxiliar. |

---

## Sistema de diseño

### Tokens de color principales

```css
/* Marca */
--sys-color-bg-brand-primary     /* Azul institucional #004899 */
--sys-color-bg-brand-accent      /* Rojo de acción #E6375D — botones primarios */

/* Superficies */
--sys-color-bg-surfaces-surface
--sys-color-bg-surfaces-surface-high
--sys-color-bg-surfaces-surface-lowest

/* Texto */
--sys-color-text-neutral-high
--sys-color-text-neutral-medium
--sys-color-text-neutral-low
--sys-color-text-neutral-disabled
```

### Alias Tailwind

```
bg-brand-primary    → accent rojo (botones de acción principal)
bg-surface          → fondo de superficies
bg-surface-muted    → fondo de hover y áreas secundarias
text-text           → texto principal
text-text-muted     → texto secundario
rounded-siaf-sm/md/lg/full
shadow-siaf-sm/md/elevation-1/elevation-2
spacing-siaf-none/xxs/xs/sm/md/lg/xl/xxl
```

### Temas

Activación mediante atributo en el elemento raíz o por preferencia del sistema:

```html
<html data-theme="light">   <!-- Claro explícito -->
<html data-theme="dark">    <!-- Oscuro explícito -->
<!-- Sin atributo: respeta prefers-color-scheme del SO -->
```

---

## Patrones técnicos

### Signals (Angular 17+)
Estado reactivo compatible con `OnPush` sin necesidad de `ChangeDetectorRef`:

```typescript
readonly isOpen = signal(false);

// Toggle en template (debe extraerse a método, no arrow function)
toggleOpen(): void {
  this.isOpen.update((v) => !v);
}
```

### Standalone Components
Todos los componentes son standalone, sin NgModules:

```typescript
@Component({
  selector: 'siaf-example',
  standalone: true,
  imports: [ButtonComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`
})
```

### Control flow moderno
Sintaxis nativa de Angular 17+, sin `*ngIf` ni `*ngFor`:

```html
@if (condition) { ... } @else { ... }
@for (item of items; track item.id; let i = $index) { ... }
```

### Nota importante sobre templates Angular
Las arrow functions no son válidas en event bindings de templates. Siempre extraer a un método del componente:

```html
<!-- INCORRECTO -->
(click)="signal.update(v => !v)"

<!-- CORRECTO -->
(click)="toggleMethod()"
```

---

## Assets

```
src/assets/figma/
├── login/
│   ├── login-hero.png          # Imagen del panel izquierdo del login
│   ├── mef-logo.png            # Logo Ministerio de Economía y Finanzas
│   ├── siaf-logo-vector.svg    # Logo SIAF-RP
│   ├── id-peru-v1.svg          # Ícono ID Peru (capa 1)
│   ├── id-peru-v2.svg          # Ícono ID Peru (capa 2)
│   ├── sunat-v1.svg            # Ícono SUNAT (capa 1)
│   ├── sunat-v2.svg            # Ícono SUNAT (capa 2)
│   ├── jne-v1.svg              # Ícono JNE (capa 1)
│   └── jne-v2.svg              # Ícono JNE (capa 2)
├── logos/                      # Variantes del logo SIAF-RP (blanco, negro, color)
└── modals/                     # Ilustraciones para modales del sistema
```
