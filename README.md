# SIAF-RP — Sistema Integrado de Administración Financiera de los Recursos Públicos

Aplicación web para la gestión de procesos financieros y contables del Estado Peruano. Construida con Angular y Tailwind CSS 4, implementa un sistema de diseño propio basado en tokens de Figma.

---

## Tecnologías

| Herramienta | Versión |
|---|---|
| Angular | 19+ |
| Tailwind CSS | 4 |
| TypeScript | 5+ |
| RxJS | 7.8+ |
| Material Icons | 1.13+ |
| Node.js requerido | ≥ 20.19.0 < 21 |
| NPM requerido | ≥ 10 |

---

## Instalación y desarrollo

```bash
npm install
npm start          # http://localhost:4200
npm run build      # Build de producción
```

---

## Estructura del proyecto

```
src/app/
├── core/
│   └── auth/                        # Guards, servicios de sesión, modelos de rol
│
├── layout/                          # Componentes del shell (instancia única cada uno)
│   ├── shell/                       # AppShellComponent con router-outlet
│   ├── navbar/
│   ├── sidebar/
│   ├── side-panel/
│   ├── mobile-navigation-menu/
│   ├── process-menu-tree/
│   ├── tray-menu/
│   ├── tray-documents-view/
│   ├── create-document/
│   └── index.ts
│
├── shared/
│   ├── ui/                          # UI Kit puro — sin lógica de negocio SIAF
│   │   └── index.ts                 # Único punto de exportación
│   └── components/                  # Componentes reutilizables entre features
│       ├── breadcrumb/
│       ├── custom-filter/
│       ├── pagination/
│       ├── data-table/
│       ├── timeline/
│       ├── solicitude-header/
│       ├── solicitude-form-card/
│       ├── solicitude-page-layout/
│       ├── solicitude-info-card/
│       └── index.ts
│
├── features/
│   ├── adjustment-seat/
│   │   └── pages/
│   │       ├── documents/           # /procesos/registro-asiento-ajuste
│   │       ├── request/             # /procesos/registro-asiento-ajuste/solicitud
│   │       └── form/                # /procesos/registro-asiento-ajuste/formulario
│   ├── chart-accounts/
│   │   └── pages/
│   │       ├── documents/           # /procesos/plan-cuentas-contables
│   │       └── request/             # /procesos/plan-cuentas-contables/solicitud
│   ├── login/
│   ├── otp-verification/
│   ├── virtual-desk/
│   ├── showcase/                    # Catálogo visual de componentes
│   └── process-configs/             # Configuración de documentos por proceso
│
├── app.routes.ts
└── app.component.ts

src/styles/
└── tokens/
    ├── generated/                   # tokens.css, tailwind.tokens.css (generados desde Figma)
    └── figma-tokens.css
```

---

## Rutas

| Ruta | Componente |
|---|---|
| `/login` | `LoginComponent` |
| `/login/recuperar-contrasena` | `OtpVerificationComponent` |
| `/panel` | `VirtualDeskComponent` |
| `/procesos/registro-asiento-ajuste` | `AdjustmentSeatDocumentsComponent` |
| `/procesos/registro-asiento-ajuste/solicitud` | `AdjustmentSeatRequestComponent` |
| `/procesos/registro-asiento-ajuste/formulario` | `AdjustmentSeatFormComponent` |
| `/procesos/plan-cuentas-contables` | `ChartAccountsDocumentsComponent` |
| `/procesos/plan-cuentas-contables/solicitud` | `ChartAccountsRequestComponent` |
| `/showcase` | `ShowcaseComponent` |

---

## Reglas de arquitectura

| Carpeta | Criterio |
|---|---|
| `shared/ui/` | 100% presentacional, sin HTTP ni lógica SIAF. Reutilizable en cualquier sistema. |
| `shared/components/` | Tiene lógica de negocio pero se usa en ≥ 2 features distintas. |
| `layout/` | Usado únicamente por `AppShellComponent`. |
| `features/X/components/` | Específico de un solo feature. |
| `features/X/pages/Y/` | Cada pantalla del feature. |

- Los features **no se importan entre sí**.
- Si algo se necesita en dos features → sube a `shared/components/`.
- `shared/ui/` nunca importa de `shared/components/` ni de `layout/`.
- Importar siempre desde el `index.ts` de la capa correspondiente.

---

## Roles y permisos

| Archivo | Responsabilidad |
|---|---|
| `core/auth/role.model.ts` | Define roles, permisos y matriz. |
| `core/auth/permission.service.ts` | `hasRole`, `can`, `canAny`. |
| `core/auth/role.guard.ts` | Restringe rutas por `data.roles` y `data.permissions`. |

---

## Assets

```
src/assets/figma/
├── login/          # Hero, logos, iconos de proveedores de identidad
├── logos/          # Variantes del logo SIAF-RP
└── modals/         # Ilustraciones para modales
```

---

## Documentación

| Documento | Contenido |
|---|---|
| `docs/guia-implementacion-pantallas-siaf.md` | Componentes disponibles, tokens, patrones de uso y reglas visuales. |
| `docs/plantilla-prompts-pantallas-siaf.md` | Plantillas para pedir nuevas pantallas o modificar flujos. |
| `RESTRUCTURACION_REALIZADA.md` | Historial de la restructuración arquitectural del proyecto. |
