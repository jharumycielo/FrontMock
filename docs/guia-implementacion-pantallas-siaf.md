# Guia de implementacion de pantallas SIAF

Este documento registra las decisiones que se van tomando al convertir los frames de Figma a Angular + Tailwind. Debe mantenerse actualizado cada vez que ajustemos un componente transversal o una regla visual.

## Objetivo

Construir pantallas como composicion de componentes transversales reutilizables. La informacion de cada formulario puede cambiar, pero la estructura, padding, gaps, radius, botoneras, tablas, paginacion, sidebar, navbar, headers y modales deben venir del design system.

## Flujo de trabajo

1. Recibir el link exacto del frame o componente de Figma.
2. Obtener contexto del nodo con Figma MCP.
3. Identificar si el bloque es transversal o especifico de una pantalla.
4. Si es transversal, actualizar o crear el componente en `src/app/shared/ui`.
5. Si es especifico, implementarlo dentro de `src/app/features`.
6. Usar tokens CSS ya existentes antes de hardcodear valores.
7. Validar con `npm run build`.
8. Levantar o refrescar el servidor local con `npm start`.
9. Actualizar este documento cuando haya una nueva regla.

## Componentes transversales actuales

Estos componentes deben reutilizarse en pantallas futuras:

- `siaf-navbar`: header superior azul del sistema. Ocupa todo el ancho antes del layout con sidebar.
- `siaf-sidebar`: sidebar rail de 64px usado en formularios. Debe iniciar debajo del navbar.
- `siaf-breadcrumb`: ruta de navegacion con alto fijo de 40px.
- `siaf-solicitude-header`: encabezado de solicitud/formulario.
- `siaf-pagination`: paginacion transversal para tablas.
- `siaf-button`: botones con variantes, iconos Material Icons, hover y pressed.
- `siaf-icon`: wrapper de Material Icons.
- `siaf-modal`: modales transversales.
- `siaf-alert`: alert/snackbar visual segun UI kit.
- `siaf-process-menu-tree`: arbol flotante de procesos desplegado desde el sidenav.
- `siaf-create-document`: panel flotante de creacion de documento desplegado desde el boton `+` del sidenav.
- `siaf-document-history-panel`: side panel parcial para consultar el historial del documento desde el icono `history`.
- `siaf-select-options`: menu transversal para opciones de select input, reemplaza el select nativo visible.

## Tokens de color

Los colores del proyecto deben salir de `src/tokens/Device/Light.tokens.json`.

El build de tokens genera:

- `--figma-light-sys-color-*`: valor directo exportado desde Figma.
- `--sys-color-*`: alias semantico que consumen los componentes.

Regla de implementacion:

- Usar nombres del UI Kit, por ejemplo `--sys-color-bg-brand-primary`, `--sys-color-text-neutral-medium`, `--sys-color-divider-default`, `--sys-color-border-feedback-success`.
- Evitar colores hardcodeados en componentes nuevos.
- Si un color cambia en Figma, se actualiza el JSON y se ejecuta `npm run tokens:build`.

## Select inputs

Los campos tipo select no deben mostrar el menu nativo del navegador.

Reglas:

- `siaf-text-field` usa `siaf-select-options` cuando `type="select"` o `type="select-multiple"`.
- `siaf-create-document` usa `siaf-select-options` para los campos seleccionables.
- El menu debe seguir Figma: superficie `--sys-color-bg-surfaces-surface-highest`, radio `8px`, elevation 8, padding vertical `8px`.
- Cada opcion tiene minimo `48px`, padding horizontal `16px`, padding vertical `12px` y texto `14px` regular en `--sys-color-text-neutral-medium`.
- Las opciones deben usar estados semanticos `--sys-color-bg-states-light-hover`, `selected` y `pressed`.

## Date picker

Los campos de fecha deben usar `siaf-date-time-picker`, no inputs nativos aislados.

Variantes:

- `variant="date"`: selector solo fecha.
- `variant="datetime"`: selector fecha y hora con acciones `Cancelar` y `Aceptar`.

Reglas:

- El input debe comportarse como `siaf-text-field`: label flotante, placeholder inicial, hover, focus, success, error y disabled.
- El popup debe usar superficie `--sys-color-bg-surfaces-surface`, radio `8px`, elevation y dias de `36px`.
- Dia seleccionado: `--sys-color-bg-brand-primary` y texto `--sys-color-text-brand-white`.
- Dias deshabilitados: `--sys-color-text-neutral-disabled`.
- Hora usa inputs compactos de `50px` x `32px`.

## Reglas de layout aprendidas

- El navbar va arriba y ocupa el ancho completo de la pantalla.
- El layout con sidebar comienza debajo del navbar.
- El sidebar tiene ancho fijo de `64px`.
- El contenido principal usa `lg:pl-16` para respetar el espacio del sidebar.
- Los formularios deben ser responsive.
- Los bloques internos deben usar flexbox/grid segun corresponda.
- No duplicar componentes transversales dentro de una pantalla.

## Sidebar

El sidebar es transversal y debe conservar:

```css
border-right: 1px solid var(--sys-color-divider-default, rgba(32, 32, 32, 0.12));
background: var(--sys-color-bg-surfaces-surface, #FFF);
```

Toda pantalla que use sidebar debe conectar las mismas acciones transversales, sin depender de la ruta donde este situado el usuario:

- `+` abre `siaf-create-document`.
- `Procesos` abre `siaf-process-menu-tree`.
- clic fuera del panel visible cierra cualquier flotante abierto.

Tipografia de labels:

```css
color: var(--sys-color-text-neutral-medium, #29292A);
text-align: center;
font-family: Inter;
font-size: 10px;
font-style: normal;
font-weight: 500;
line-height: normal;
```

Todos los botones/items del sidebar deben tener:

- `hover`
- `pressed` / `active`
- estado seleccionado cuando aplique

Al hacer clic en `Procesos`, el sidebar debe marcar `Proceso` como activo y abrir el arbol flotante `siaf-process-menu-tree` al lado derecho del rail.

Al hacer clic en el boton `+`, el sidebar debe abrir el panel flotante `siaf-create-document` al lado derecho del rail. Si hay otro panel flotante abierto, debe cerrarse antes de mostrar el nuevo.

Los paneles flotantes laterales deben cerrarse al hacer clic fuera del frame visible.

## Crear documento flotante

El panel `siaf-create-document` es transversal para iniciar flujos desde el sidenav.

Reglas desde Figma:

- ancho desktop `370px`
- posicion flotante junto al sidenav: `left: 64px; top: 56px`
- alto disponible debajo del navbar
- radio `8px`
- sombra elevation 1
- header con titulo `CREAR DOCUMENTO`, `16px`, bold, uppercase
- campos outlined de `40px`, radio `8px`, borde `rgba(32,32,32,0.4)`
- labels flotantes de `12px`, medium
- texto de campo `14px`, regular
- selects con icono `expand_more`
- botones alineados a la derecha: `Cancelar` secundario y `Aceptar` accent

## Historial del documento

El panel `siaf-document-history-panel` es transversal para abrir el historial desde el boton con icono `history` en tablas de documentos o registros.

Reglas desde Figma:

- no debe ocupar todo el ancho en desktop
- maximo desktop `1287px`, alineado hacia la derecha sobre un overlay
- en mobile puede ocupar casi todo el ancho con margen lateral
- header de `56px` con titulo `HISTORIAL DEL DOCUMENTO`
- cierre con icono Material `close`
- contenido en flex column con scroll vertical interno
- bloque readonly inicial con `Documento`, `Nro de documento` y `Tipo de accion`
- acordeon de atributos expandible/colapsable
- tabla de historial con columnas `Usuario`, `Unidad organizacional`, `Fecha` y `Estado`

## Arbol flotante de procesos

El arbol de procesos es transversal para pantallas que navegan por procesos/procedimientos.

Reglas desde Figma:

- ancho desktop `370px`
- alto `calc(100vh - 56px)` debajo del navbar
- posicion flotante junto al sidenav: `left: 64px; top: 56px`
- header blanco de `56px` con titulo `PROCESOS`
- titulo `16px`, bold, uppercase
- buscador de `40px`, radio `8px`, borde `rgba(32,32,32,0.4)`
- subtitulo `14px`, bold
- fila raiz `48px`, seleccionada con `rgba(1,72,153,0.08)`
- filas hijas `32px`
- lineas de jerarquia con `rgba(32,32,32,0.24)`
- texto activo `#014899`
- debe permitir expandir/colapsar niveles

Ejemplo:

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

Navegacion actual:

- `Proceso de registro de asiento de ajuste` navega a `/procesos/registro-asiento-ajuste`.
- Desde el listado de documentos, un documento puede navegar al detalle/formulario en `/procesos/registro-asiento-ajuste/formulario`.

## Navbar

El navbar transversal debe mantener:

- altura `56px`
- fondo `--sys-color-bg-brand-primary`
- logo SIAF-RP
- boton menu
- icono de notificaciones
- avatar con iniciales
- nombre de usuario
- nombre de oficina
- flecha desplegable

Debe estar fuera del contenedor con sidebar para ocupar todo el ancho.

## Breadcrumb

El breadcrumb transversal debe mantener:

- alto `40px`
- fondo blanco
- padding horizontal `16px`
- padding vertical `4px`
- gap `4px`
- home como boton de `32px`
- icono home de `20px`
- separadores `keyboard_arrow_right` de `12px`
- texto caption de `12px`

## Paginacion

La paginacion es transversal para todas las tablas.

Reglas:

- Debe ocupar todo el ancho disponible.
- El selector de filas por pagina es un `<select>` real.
- Las opciones deben ser configurables, por ejemplo `[10, 25, 50, 100]`.
- El texto `1-25 de 800` no debe ser hardcodeado en pantalla.
- El rango debe calcularse desde:
  - `page`
  - `pageSize` / `rowsPerPage`
  - `totalItems`
- Al cambiar filas por pagina, normalmente se debe regresar a `page = 1`.

Ejemplo:

```html
<siaf-pagination
  navigation="Activate"
  position="Bottom"
  [rowPage]="true"
  [page]="page"
  [pageSize]="rowsPerPage"
  [totalItems]="totalItems"
  [totalPages]="totalPages"
  [rowsPerPage]="rowsPerPage"
  [rowsPerPageOptions]="[10, 25, 50, 100]"
  (rowsPerPageChange)="onRowsPerPageChange($event)"
/>
```

## Iconos

- Usar `material-icons` instalado por npm.
- No usar CDN.
- Siempre consumir iconos mediante `siaf-icon`.
- Si Figma usa un nombre no disponible en Material Icons clasico, agregar alias en `icon.component.ts`.

## Botones

Todos los botones del sistema deben tener:

- estado base
- `hover`
- `pressed` / `active`
- `disabled`
- focus visible

Los botones con iconos deben usar `siaf-icon`.

## Acordeones

Cuando Figma indique `Expansion-panels` o accordion:

- Implementar como acordeon real, no como bloque estatico.
- Puede usarse `<details open>` si el comportamiento es simple.
- Debe tener header, divisor y contenido colapsable.
- Respetar radius, borde, padding y alto del header del nodo Figma.

## Validaciones antes de cerrar una pantalla

- `npm run build` debe compilar sin errores.
- Confirmar que los componentes transversales no se duplicaron dentro de la pantalla.
- Revisar que los textos no esten en 14px si Figma pide 10px o 12px.
- Verificar que navbar, sidebar, breadcrumb y paginacion mantengan sus medidas transversales.
- Revisar responsive en mobile y desktop.
- Confirmar que la data dinamica no este hardcodeada cuando dependa de tabla, paginacion o estado.

## Como actualizar esta guia

Cada vez que se corrija un componente transversal:

1. Agregar la regla en la seccion correspondiente.
2. Indicar si aplica a todas las pantallas o solo a una feature.
3. Si hay valores CSS exactos desde Figma, pegarlos aqui.
4. Si cambia el API del componente, agregar un ejemplo de uso.
