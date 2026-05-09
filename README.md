# SIAF-RP - Sistema Integrado de Administracion Financiera de los Recursos Publicos

Aplicacion web para la gestion de procesos financieros y contables del Estado Peruano. Esta construida con Angular y Tailwind CSS 4, y usa un sistema de diseno propio basado en tokens exportados desde Figma.

## Tecnologias

| Herramienta | Version |
| --- | --- |
| Angular | 19+ |
| Tailwind CSS | 4 |
| TypeScript | 5+ |
| RxJS | 7.8+ |
| Material Icons | 1.13+ |
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
|   |       `-- request/
|   |-- documents-records/
|   |-- login/
|   |-- otp-verification/
|   |-- process-configs/
|   |-- showcase/
|   `-- virtual-desk/
|-- app.routes.ts
`-- app.component.ts

src/styles/
`-- tokens/
    |-- generated/
    |   |-- tokens.css
    |   `-- tailwind.tokens.css
    `-- figma-tokens.css
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
- Las rutas de procesos cargan pantallas con `loadComponent`.

## Tokens y estilos

- Los colores, radios, elevaciones y estados visuales deben salir de tokens.
- No usar hexadecimales ni sombras hardcodeadas en componentes.
- `src/styles.css` contiene imports globales, reset y reglas base.
- `src/styles/tokens/generated/tailwind.tokens.css` expone tokens consumibles por Tailwind.
- `src/styles/tokens/generated/tokens.css` expone variables CSS del sistema.
- Para elevaciones usar clases/tokens como `shadow-siaf-sm`, `shadow-siaf-md`, `shadow-siaf-lg` o variables `--sys-effects-*`.

## Componentes clave

| Componente | Capa | Uso |
| --- | --- | --- |
| `siaf-input` | `shared/ui` | Inputs de texto, select y select multiple. |
| `text-area-control` | `shared/ui` | Textareas con estado, contador y required. |
| `readonly-field` | `shared/ui` | Representacion de campos en modo lectura. |
| `siaf-flow-status-tag` | `shared/ui` | Estados oficiales de documentos y registros. |
| `siaf-custom-filter` | `shared/components` | Filtros personalizados globales. |
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

## Flujo de cuentas contables

La solicitud de cuentas contables permite:

- Seleccionar plan de cuentas.
- Crear cuentas contables con validacion de codigo.
- Agregar las cuentas creadas a la tabla de detalle.
- Editar una cuenta creada recuperando los datos originales.
- Eliminar solo cuando hay seleccion.
- Grabar cuando la solicitud esta completa.
- Pasar a modo lectura elaborado despues de grabar.

Reglas del codigo contable:

- El punto `.` es separador visual y funcional.
- Se aceptan de 1 a 7 segmentos.
- El primer segmento acepta 1 digito.
- Los segmentos siguientes aceptan 1 o 2 digitos.
- Ejemplos validos: `1`, `1.1`, `1.22.31.1`.
- Ejemplo invalido: `1101` porque no usa separadores.

## Documentacion

| Documento | Contenido |
| --- | --- |
| `docs/guia-implementacion-pantallas-siaf.md` | Reglas de implementacion, tokens, componentes y patrones. |
| `docs/plantilla-prompts-pantallas-siaf.md` | Plantillas para solicitar pantallas y flujos. |
| `RESTRUCTURACION_REALIZADA.md` | Registro de cambios arquitecturales y mejoras aplicadas. |
