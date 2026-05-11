# SIAF-RP - Sistema Integrado de Administracion Financiera de los Recursos Publicos

Aplicacion web para la gestion de procesos financieros y contables del Estado Peruano. Esta construida con Angular y Tailwind CSS 4, y usa un sistema de diseno propio basado en tokens exportados desde Figma.

## Tecnologias

| Herramienta | Version |
| --- | --- |
| Angular | 20+ |
| Tailwind CSS | 4 |
| TypeScript | 5.9+ |
| RxJS | 7.8+ |
| Material Icons | 1.13+ |
| xlsx | 0.18+ |
| Node.js requerido | >= 20.19.0 < 21 |
| NPM requerido | >= 10 |

## Instalacion y desarrollo

```bash
npm install
npm start
npm run build
npm run typecheck
npm run tokens:build
```

Servidor local por defecto: `http://localhost:4200`.

Scripts principales:

| Script | Uso |
| --- | --- |
| `npm start` | Levanta Angular en `127.0.0.1:4200`. |
| `npm run typecheck` | Compila en configuracion development. |
| `npm run build` | Genera build de produccion. |
| `npm run tokens:build` | Regenera tokens desde la fuente de Figma. |
| `npm run verify` | Ejecuta tokens y typecheck. |
| `npm run ci` | Ejecuta tokens y build. |

## Estructura del proyecto

```text
src/app/
|-- core/
|   `-- auth/                         # Roles, permisos, guards y sesion
|-- layout/                           # Shell de la aplicacion
|   |-- shell/
|   |-- navbar/
|   |-- sidebar/
|   |-- side-panel/
|   |-- mobile-navigation-menu/
|   |-- process-menu-tree/
|   |-- tray-menu/
|   |-- tray-documents-view/
|   |-- create-document/
|   `-- index.ts
|-- shared/
|   |-- ui/                           # UI Kit puro, sin logica SIAF
|   |   `-- index.ts
|   `-- components/                   # Componentes transversales con logica de negocio
|       |-- breadcrumb/
|       |-- custom-filter/
|       |-- data-table/
|       |-- form-table-search/
|       |-- pagination/
|       |-- table-controls/
|       |-- timeline/
|       |-- solicitude-header/
|       |-- solicitude-form-card/
|       |-- solicitude-page-layout/
|       |-- solicitude-info-card/
|       `-- index.ts
|-- features/
|   |-- adjustment-seat/
|   |   `-- pages/
|   |       |-- documents/
|   |       |-- request/
|   |       `-- form/
|   |-- chart-accounts/
|   |   `-- pages/
|   |       |-- documents/
|   |       |-- request/
|   |       `-- bulk-request/
|   |-- documents-records/
|   |-- login/
|   |-- otp-verification/
|   |-- process-configs/
|   |-- showcase/
|   `-- virtual-desk/
|-- app.routes.ts
`-- app.component.ts

src/
|-- styles.css
`-- styles/
    `-- tokens/
        |-- base.css
        |-- figma.css
        |-- generated/
        |   `-- tailwind.tokens.css
        |-- index.css
        `-- themes/
            |-- dark.css
            |-- index.css
            `-- light.css
```

## Rutas principales

| Ruta | Componente |
| --- | --- |
| `/login` | `LoginComponent` |
| `/login/recuperar-contrasena` | `OtpVerificationComponent` |
| `/panel` | `VirtualDeskComponent` |
| `/procesos/registro-asiento-ajuste` | `AdjustmentSeatDocumentsComponent` |
| `/procesos/registro-asiento-ajuste/solicitud` | `AdjustmentSeatRequestComponent` |
| `/procesos/registro-asiento-ajuste/formulario` | `AdjustmentSeatFormComponent` |
| `/procesos/plan-cuentas-contables` | `ChartAccountsDocumentsComponent` |
| `/procesos/plan-cuentas-contables/solicitud` | `ChartAccountsRequestComponent` |
| `/procesos/plan-cuentas-contables/carga-masiva/solicitud` | `ChartAccountsBulkRequestComponent` |
| `/showcase` | `ShowcaseComponent` |

## Reglas de arquitectura

| Carpeta | Criterio |
| --- | --- |
| `shared/ui/` | Componentes presentacionales, sin HTTP ni logica SIAF. Reutilizables en cualquier sistema. |
| `shared/components/` | Componentes transversales con logica de negocio compartida entre dos o mas features. |
| `layout/` | Componentes exclusivos del shell. Se instancian desde `AppShellComponent`. |
| `features/[feature]/components/` | Componentes especificos de un proceso. |
| `features/[feature]/pages/[page]/` | Pantallas del proceso. |

Reglas:

- Los features no se importan entre si.
- Si algo se necesita en dos features, debe subir a `shared/components/`.
- `shared/ui/` nunca importa desde `shared/components/`, `layout/` ni `features/`.
- Las rutas de procesos cargan pantallas con `loadComponent` o `loadChildren`.

## Tokens y estilos

- Los colores, radios, elevaciones y estados visuales deben salir de tokens.
- No usar hexadecimales ni sombras hardcodeadas en componentes.
- `src/styles.css` contiene imports globales, reset y reglas base.
- `src/styles/tokens/base.css` contiene aliases estables que no dependen de tema.
- `src/styles/tokens/figma.css` contiene variables base exportadas desde Figma.
- `src/styles/tokens/themes/light.css` contiene solo overrides puntuales del modo claro.
- `src/styles/tokens/themes/dark.css` contiene los overrides del modo oscuro y debe respetar contraste WCAG.
- `src/styles/tokens/generated/tailwind.tokens.css` expone tokens consumibles por Tailwind.
- Para elevaciones usar clases/tokens como `shadow-siaf-sm`, `shadow-siaf-md`, `shadow-siaf-lg` o variables `--sys-effects-*`.

### Tema claro y oscuro

- El tema activo se define en `document.documentElement` con `data-theme="light"` o `data-theme="dark"`.
- El cambio de tema se ejecuta desde `siaf-navbar` y usa View Transitions con `clip-path` cuando el navegador lo soporta.
- En modo dark, los colores deben salir de tokens; evitar hexadecimales en componentes.
- Para paneles como arbol de procesos y Crear documento usar `--sys-color-bg-surfaces-field`.
- Para inputs habilitados usar `--sys-color-bg-surfaces-surface`.
- Para inputs y botones deshabilitados usar `--sys-color-bg-surfaces-disabled`.
- Los SVG de modales cargados como `<img>` no heredan CSS; el modal cambia automaticamente a `assets/figma/modals-dark/` cuando el tema es oscuro.
- El icono del snackbar usa `--sys-color-icon-snackbar-success` para conservar el color semantico en dark.

## Componentes clave

| Componente | Capa | Uso |
| --- | --- | --- |
| `siaf-input` | `shared/ui` | Inputs de texto, select y select multiple. |
| `siaf-date-time-picker` | `shared/ui` | Campo de fecha y fecha/hora con estados. |
| `text-area-control` | `shared/ui` | Textareas con estado, contador y required. |
| `readonly-field` | `shared/ui` | Representacion de campos en modo lectura. |
| `siaf-flow-status-tag` | `shared/ui` | Estados oficiales de documentos y registros. |
| `siaf-snackbar` | `shared/ui` | Mensajes de confirmacion y estados de solicitud. |
| `siaf-upload-side-nav` | `shared/ui` | Panel lateral para carga de archivos y variantes de carga masiva. |
| `siaf-custom-filter` | `shared/components` | Filtros personalizados globales. |
| `siaf-form-table-search` | `shared/components` | Buscador de tablas dentro de formularios y sidepanels. |
| `siaf-table-controls` | `shared/components` | Checkbox maestro, acciones de tabla y paginacion superior/inferior. |
| `siaf-pagination` | `shared/components` | Paginacion reutilizable. |
| `siaf-solicitude-page-layout` | `shared/components` | Layout de solicitudes. |
| `siaf-solicitude-form-card` | `shared/components` | Secciones de formularios. |
| `siaf-create-document` | `layout` | Creacion de documentos desde el sidebar. |

## Modo lectura

Cuando una solicitud pasa a estado elaborado o se abre para visualizar:

- Los campos editables deben convertirse a `readonly-field`.
- Los radio buttons muestran solo el texto seleccionado (`Si`, `No` o `--`).
- Los select muestran el label de la opcion, no el value interno.
- Los select multiple muestran los labels separados por coma.
- Los textareas muestran su contenido en `readonly-field`.
- Los botones de accion contextual se ocultan, no se dejan solo deshabilitados.
- Las tablas de detalle ocultan checkboxes y acciones; el registro puede abrirse en vista lectura.

## Tablas y seleccion

- Usar `siaf-table-controls` cuando una tabla tenga seleccion masiva, acciones o paginacion.
- Los iconos de editar, eliminar y menu solo se muestran cuando hay seleccion.
- El checkbox maestro usa estado indeterminado cuando hay seleccion parcial.
- En `Documentos y registros`, la seleccion multiple para verificar solo aplica a documentos en estado `Elaborado`; los estados `Verificado` quedan deshabilitados.
- En formularios y sidepanels de seleccion se debe usar `siaf-form-table-search`.
- Evitar reutilizar el buscador antiguo de documentos y registros en formularios.
- `siaf-form-table-search` soporta estado deshabilitado para preservar accesibilidad visual en dark mode.

## Flujo de cuentas contables

La solicitud de cuentas contables permite:

- Seleccionar plan de cuentas.
- Crear cuentas contables con validacion de codigo.
- Agregar las cuentas creadas a la tabla de detalle.
- Editar una cuenta creada recuperando los datos originales.
- Eliminar solo cuando hay seleccion.
- Grabar cuando la solicitud esta completa.
- Pasar a modo lectura elaborado despues de grabar.
- Abrir carga masiva para crear una solicitud desde una plantilla Excel.

Reglas del codigo contable:

- El punto `.` es separador visual y funcional.
- Se aceptan de 1 a 7 segmentos.
- El primer segmento acepta 1 digito.
- Los segmentos siguientes aceptan 1 o 2 digitos.
- Ejemplos validos: `1`, `1.1`, `1.22.31.1`.
- Ejemplo invalido: `1101` porque no usa separadores.

## Carga masiva de plan de cuentas contables

La carga masiva de plan de cuentas contables se encuentra en:

- Ruta: `/procesos/plan-cuentas-contables/carga-masiva/solicitud`.
- Componente: `ChartAccountsBulkRequestComponent`.
- Panel de carga: `siaf-upload-side-nav`.
- Plantilla: `src/assets/templates/plantilla-carga-masiva-plan-cuentas-contables-creacion.xlsx`.

Flujo esperado:

- El boton de carga masiva abre el sidenav de carga.
- El usuario descarga la plantilla desde el enlace del texto de ayuda.
- La plantilla contiene una cabecera con Nombre del plan de cuentas contables y Descripcion del plan de cuentas contables.
- La hoja `Carga masiva` contiene las cuentas en columnas separadas por estructura contable.
- Al aceptar se valida/procesa el archivo con loader y luego se muestra snackbar de exito.
- La pantalla resultante muestra los datos cargados desde el Excel en una tabla con buscador y paginacion.
- La justificacion del sustento no se autocompleta desde la carga masiva; se mantiene como informacion de la pantalla principal.

Columnas de detalle esperadas en la plantilla:

- Elemento.
- Grupo.
- Cuenta.
- Subcuenta 1.
- Subcuenta 2.
- Subcuenta 3.
- Nombre de la cuenta contable.
- Es imputable.

Reglas de la plantilla:

- El elemento acepta un digito (`1`, `2`, etc.).
- Los demas segmentos aceptan hasta dos digitos (`1` a `99`), sin ceros iniciales obligatorios.
- Nombre y descripcion del plan se informan una sola vez como cabecera, no por cada fila.

Tipos de plan contable disponibles:

- Plan Contable Gubernamental Unico.
- Plan Contable General Empresarial.
- Manual de Contabilidad para las Empresas del Sistema Financiero.

Para carga inicial, el campo "Plan contable actual por reemplazar" no es requerido. Para una segunda carga de reemplazo, si debe seleccionarse el plan vigente.

## Navbar, sesion y tema

- `siaf-navbar` muestra opciones de usuario: Perfil, Aspecto Claro/Oscuro, Configuracion y Cerrar sesion.
- La opcion de aspecto alterna el tema global entre claro y oscuro.
- Cerrar sesion limpia la sesion de autenticacion y redirige a `/login`.

## Documentacion

| Documento | Contenido |
| --- | --- |
| `docs/guia-implementacion-pantallas-siaf.md` | Reglas de implementacion, tokens, componentes y patrones. |
| `docs/plantilla-prompts-pantallas-siaf.md` | Plantillas para solicitar pantallas y flujos. |
| `RESTRUCTURACION_REALIZADA.md` | Registro de cambios arquitecturales y mejoras aplicadas. |
