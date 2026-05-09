# Reestructuracion arquitectural - SIAF-RP

**Fecha base:** 4 de mayo de 2026  
**Ultima actualizacion:** 8 de mayo de 2026  
**Estado:** completado y verificado con `npm run typecheck`.

## Objetivo

Reorganizar el proyecto para que sea escalable, con separacion clara entre UI Kit, componentes transversales, layout y features. La arquitectura anterior mezclaba componentes de shell, negocio y UI dentro de `shared/ui/`, y algunas pantallas vivian como carpetas sueltas.

## Estructura resultante

```text
src/app/
|-- core/
|   `-- auth/
|-- layout/
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
|   |-- ui/
|   `-- components/
|-- features/
|   |-- adjustment-seat/
|   |-- chart-accounts/
|   |-- documents-records/
|   |-- process-configs/
|   |-- showcase/
|   `-- virtual-desk/
|-- app.routes.ts
`-- app.component.ts
```

## Cambios ejecutados

### 1. Separacion de capas

| Capa | Responsabilidad |
| --- | --- |
| `shared/ui/` | UI Kit puro, presentacional y reusable. |
| `shared/components/` | Componentes transversales con logica de negocio. |
| `layout/` | Shell, navegacion, sidebar, bandeja y creacion de documentos. |
| `features/` | Pantallas y flujos por proceso. |

### 2. Componentes movidos a `shared/components/`

| Componente | Motivo |
| --- | --- |
| `solicitude-header` | Cabecera transversal de solicitudes. |
| `solicitude-form-card` | Card de formulario transversal. |
| `solicitude-page-layout` | Layout estandar de solicitudes. |
| `solicitude-info-card` | Datos generales de la solicitud. |
| `pagination` | Paginacion compartida. |
| `data-table` | Tabla reusable. |
| `timeline` | Historial de flujo. |
| `custom-filter` | Filtros personalizados globales. |
| `table-controls` | Checkbox maestro, acciones y paginacion de tablas. |

### 3. Componentes exclusivos del shell

| Componente | Ubicacion |
| --- | --- |
| `navbar` | `layout/navbar/` |
| `sidebar` | `layout/sidebar/` |
| `side-panel` | `layout/side-panel/` |
| `mobile-navigation-menu` | `layout/mobile-navigation-menu/` |
| `process-menu-tree` | `layout/process-menu-tree/` |
| `tray-menu` | `layout/tray-menu/` |
| `tray-documents-view` | `layout/tray-documents-view/` |
| `create-document` | `layout/create-document/` |

### 4. Reorganizacion de features

| Feature | Estructura actual |
| --- | --- |
| Registro de asiento de ajuste | `features/adjustment-seat/pages/documents`, `request`, `form` |
| Plan de cuentas contables | `features/chart-accounts/pages/documents`, `request` |
| Documentos y registros | `features/documents-records/` |
| Catalogo visual | `features/showcase/` |

### 5. Tokens y estilos

Se consolido la estrategia de tokens:

- `src/styles.css` queda como entrada global: imports, reset y reglas base.
- `src/styles/tokens/generated/tokens.css` contiene variables CSS.
- `src/styles/tokens/generated/tailwind.tokens.css` contiene tokens consumibles desde Tailwind.
- No se deben usar colores ni sombras hardcodeadas en componentes.
- Elevaciones, colores de checkbox, estados y required usan tokens semanticos.

### 6. Componentes y patrones agregados o consolidados

| Componente / patron | Estado |
| --- | --- |
| `readonly-field` | Usado para modo lectura en inputs, selects, select multiple, radios, checkboxes y textareas. |
| `siaf-table-controls` | Global para seleccion, acciones y paginacion de tablas. |
| `siaf-custom-filter` | Global para filtros personalizados responsive. |
| `siaf-flow-status-tag` | Estados oficiales del documento y registros. |
| Checkbox global | Usa tokens de enabled, disabled, active e indeterminate. |
| Required global | Usa token semantico de danger para el `*`. |

### 7. Solicitud de cuentas contables

La pantalla `ChartAccountsRequestComponent` quedo alineada con el flujo de solicitudes:

- Permite crear cuentas contables y agregarlas a una tabla de detalle.
- El boton Aceptar del formulario de cuenta se habilita segun casuisticas.
- El boton Grabar de la solicitud se habilita cuando la solicitud esta completa.
- Al grabar, pasa a estado elaborado y modo lectura.
- En modo lectura se ocultan acciones, checkboxes y botones contextuales.
- Al editar, recupera todos los datos ingresados previamente.
- Al visualizar un registro de la tabla, abre el detalle en modo lectura.
- `Vigencia`, `Visible` y `Tiene dinamica contable` se controlan por reglas del formulario.
- Si una cuenta no es imputable, la dinamica contable queda en `No` y sus controles quedan deshabilitados.

### 8. Documentos, registros y bandeja

- Los filtros personalizados se aplican en documentos, registros y bandeja.
- La tabla de documentos usa seleccion solo para estados permitidos.
- La verificacion multiple aplica solo a documentos en estado `Elaborado`.
- Los documentos en estado `Verificado` deshabilitan su checkbox.
- El checkbox maestro muestra indeterminate cuando hay seleccion parcial.
- Las acciones de tabla solo aparecen cuando hay seleccion.

## Reglas de arquitectura vigentes

- No importar entre features.
- Subir a `shared/components/` si se reutiliza entre dos o mas features.
- Mantener `shared/ui/` sin logica de negocio.
- Usar tokens semanticos antes de agregar nuevos valores.
- No usar hexadecimales ni `box-shadow` hardcodeado.
- Validar con `npm run typecheck` despues de cambios relevantes.

## Estado de verificacion

Ultima validacion realizada:

```bash
npm run typecheck
```

Resultado: build de desarrollo generado correctamente.
