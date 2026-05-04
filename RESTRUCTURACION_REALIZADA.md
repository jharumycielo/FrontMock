# RESTRUCTURACIÓN ARQUITECTURAL — SIAF-RP

**Fecha de ejecución:** 4 de Mayo, 2026
**Estado:** ✅ COMPLETADO Y VERIFICADO (build sin errores)

---

## Objetivo

Reorganizar el proyecto para que sea escalable, con separación clara de responsabilidades y sin duplicados. La arquitectura anterior tenía componentes de layout, negocio y UI Kit mezclados en `shared/ui/`, y las features como archivos sueltos sin estructura interna.

---

## Estructura resultante

```
src/app/
├── core/
│   └── auth/                        # Guards, servicios de sesión, modelos de rol
│
├── layout/                          # Componentes estructurales del shell (instancia única)
│   ├── shell/                       # AppShellComponent — layout principal con router-outlet
│   ├── navbar/                      # Barra superior
│   ├── sidebar/                     # Navegación lateral
│   ├── side-panel/                  # Panel lateral auxiliar
│   ├── mobile-navigation-menu/      # Menú móvil
│   ├── process-menu-tree/           # Árbol de procesos del sidenav
│   ├── tray-menu/                   # Menú de bandeja
│   ├── tray-documents-view/         # Vista de documentos de bandeja
│   ├── create-document/             # Panel de creación de documentos
│   └── index.ts
│
├── shared/
│   ├── ui/                          # UI Kit puro — CERO lógica de negocio
│   │   ├── button/, alert/, badge/, input, checkbox, radio, switch...
│   │   └── index.ts                 # Único punto de exportación del UI Kit
│   │
│   └── components/                  # Componentes reutilizables con lógica de negocio
│       ├── breadcrumb/
│       ├── custom-filter/
│       ├── pagination/              # movido desde shared/ui
│       ├── data-table/              # movido desde shared/ui
│       ├── timeline/                # movido desde shared/ui
│       ├── solicitude-header/       # movido desde shared/ui
│       ├── solicitude-form-card/    # movido desde shared/ui
│       ├── solicitude-page-layout/  # movido desde shared/ui
│       ├── solicitude-info-card/    # movido desde shared/ui
│       └── index.ts
│
└── features/
    ├── adjustment-seat/             # Feature: Asiento de Ajuste
    │   ├── pages/
    │   │   ├── documents/           # Lista de solicitudes
    │   │   ├── request/             # Crear nueva solicitud
    │   │   └── form/                # Formulario de asiento
    │   └── index.ts
    │
    ├── chart-accounts/              # Feature: Plan de Cuentas Contables
    │   ├── pages/
    │   │   ├── documents/           # Lista de solicitudes
    │   │   └── request/             # Crear nueva solicitud
    │   └── index.ts
    │
    ├── login/
    ├── otp-verification/
    ├── virtual-desk/
    ├── showcase/
    └── process-configs/             # Configuraciones por proceso (documentos, rutas)
```

---

## Cambios ejecutados

### 1. Eliminación de duplicados en `layout/`

`shared/ui/navbar/` y `shared/ui/side-panel/` existían como copias idénticas de sus versiones en `layout/`. Se eliminaron las copias de `shared/ui/` y se corrigió el import relativo roto en `layout/side-panel/side-panel.component.ts`.

### 2. Movidos a `shared/components/` (componentes con lógica de negocio)

| Componente | Origen | Destino |
|---|---|---|
| `solicitude-header` | `shared/ui/` | `shared/components/` |
| `solicitude-form-card` | `shared/ui/` | `shared/components/` |
| `solicitude-page-layout` | `shared/ui/` | `shared/components/` |
| `solicitude-info-card` | `shared/ui/` | `shared/components/` |
| `pagination` | `shared/ui/` | `shared/components/` |
| `data-table` | `shared/ui/` | `shared/components/` |
| `timeline` | `shared/ui/` | `shared/components/` |

### 3. Movidos a `layout/` (componentes exclusivos del shell)

| Componente | Origen | Destino |
|---|---|---|
| `mobile-navigation-menu` | `shared/ui/` | `layout/` |
| `process-menu-tree` | `shared/ui/` | `layout/` |
| `tray-menu` | `shared/ui/` | `layout/` |
| `tray-documents-view` | `shared/ui/` | `layout/` |
| `create-document` | `shared/ui/` | `layout/` |

### 4. Reorganización de features en `pages/`

| Feature | Antes | Después |
|---|---|---|
| Asiento de Ajuste | `features/adjustment-seat-documents/` `features/adjustment-seat-request/` `features/adjustment-seat-form/` | `features/adjustment-seat/pages/documents/` `features/adjustment-seat/pages/request/` `features/adjustment-seat/pages/form/` |
| Plan de Cuentas | `features/chart-accounts-documents/` `features/chart-accounts-request/` | `features/chart-accounts/pages/documents/` `features/chart-accounts/pages/request/` |

`app.routes.ts` actualizado con las nuevas rutas de `loadComponent`.

### 5. Tipos exportados desde `shared/ui/index.ts`

Se agregó `export` a los tipos internos de los componentes más usados para habilitar autocompletado TypeScript:

- `AlertTone`, `BadgeTone`, `TagTone`
- `TextFieldType`, `TextFieldState`
- `DatePickerVariant`, `DatePickerState`
- `IconVariant`

### 6. Nuevos componentes UI Kit

- `siaf-alert` — alert inline con 5 tonos (`neutral`, `info`, `success`, `warning`, `error`), título, descripción, botón de cierre. Rediseñado desde cero para coincidir con el Figma (reemplazó el toast oscuro anterior).
- `material-icons-outlined` — fuente cargada en `styles.css` (antes solo se cargaba `material-icons` filled).

---

## Reglas de arquitectura establecidas

### ¿Dónde va cada componente?

| Carpeta | Criterio |
|---|---|
| `shared/ui/` | Componente 100% presentacional, sin HTTP, sin lógica de negocio SIAF. Reutilizable en cualquier sistema. |
| `shared/components/` | Tiene lógica de negocio pero se usa en ≥2 features distintas. |
| `layout/` | Usado únicamente por `AppShellComponent`. Singleton. |
| `features/X/components/` | Específico de un solo feature. |

### Regla de imports

- Los features no se importan entre sí.
- Si algo se necesita en dos features → sube a `shared/components/`.
- `shared/ui/` nunca importa de `shared/components/` ni de `layout/`.

---

## Resumen numérico

| Aspecto | Antes | Después |
|---|---|---|
| Componentes en `shared/ui/` | ~56 | 46 (UI Kit puro) |
| Componentes en `shared/components/` | 2 | 9 |
| Componentes en `layout/` | 3 | 9 |
| Features con estructura `pages/` | 0 | 2 (adjustment-seat, chart-accounts) |
| Duplicados de layout | 2 | 0 |
| Tipos TypeScript exportados | parcial | completo para componentes clave |
