# SIAF-RP — Frontend

Aplicación web para la gestión de procesos financieros y contables del Estado Peruano. Construida con Angular 20 y Tailwind CSS 4, con un sistema de diseño propio basado en tokens exportados desde Figma.

> 📦 **Backend:** repositorio separado 

---

## Stack tecnológico

| Herramienta | Versión |
|---|---|
| Angular | 20+ |
| Tailwind CSS | 4 |
| TypeScript | 5.9+ |
| RxJS | 7.8+ |
| Material Icons | 1.13+ |
| xlsx | 0.18+ |
| Node.js | >= 20.19.0 < 21 |
| NPM | >= 10 |

---

## Instalación y desarrollo

```bash
npm install
npm start                # http://localhost:4200
npm run build
npm run typecheck
npm run tokens:build
```

| Script | Descripción |
|---|---|
| `npm start` | Levanta Angular en `http://localhost:4200` |
| `npm run typecheck` | Verifica tipos TypeScript |
| `npm run build` | Genera build de producción |
| `npm run tokens:build` | Regenera tokens desde Figma |

---

## Estructura del proyecto

```
src/app/
├── core/                 ← Auth, modelos, configuración global
│   ├── auth/             ← Roles, permisos, guards
│   ├── models/           ← Interfaces comunes
│   └── config/           ← App config + catálogo de procesos
├── layout/               ← Shell del sistema
│   ├── shell/
│   ├── navbar/
│   ├── sidebar/
│   ├── virtual-desk/     ← Portal central (escritorio)
│   ├── admin-menu/       ← Panel de administración
│   ├── process-menu-tree/
│   ├── tray-menu/
│   ├── tray-documents-view/
│   └── create-document/
├── shared/
│   ├── ui/               ← UI Kit puro (45+ componentes)
│   └── components/       ← Componentes con lógica de negocio
├── modules/              ← Módulos de gestión (escalable)
│   ├── contabilidad/     ← Módulo de Gestión Contable
│   │   ├── plan-cuentas/
│   │   ├── asiento-ajuste/
│   │   └── config/
│   └── admin/            ← Administración (OGTI + ADMIN_ENTIDAD)
│       ├── usuarios/
│       ├── entidades/
│       ├── unidades/
│       └── auditoria/
└── features/             ← Solo páginas públicas
    ├── login/
    ├── otp-verification/
    └── showcase/
```

---

## Rutas

### Públicas
| Ruta | Componente |
|---|---|
| `/login` | `LoginComponent` |
| `/login/recuperar-contrasena` | `OtpVerificationComponent` |
| `/showcase` | `ShowcaseComponent` |

### Módulo Contabilidad
| Ruta | Componente |
|---|---|
| `/panel` | `VirtualDeskComponent` |
| `/procesos/plan-cuentas-contables` | `ChartAccountsDocumentsComponent` |
| `/procesos/plan-cuentas-contables/solicitud` | `ChartAccountsRequestComponent` |
| `/procesos/plan-cuentas-contables/carga-masiva/solicitud` | `ChartAccountsBulkRequestComponent` |
| `/procesos/registro-asiento-ajuste` | `AdjustmentSeatDocumentsComponent` |
| `/procesos/registro-asiento-ajuste/solicitud` | `AdjustmentSeatRequestComponent` |
| `/procesos/registro-asiento-ajuste/formulario` | `AdjustmentSeatFormComponent` |

### Módulo Administración
| Ruta | Componente |
|---|---|
| `/admin/usuarios` | `AdminUsuariosComponent` |
| `/admin/usuarios/nuevo` | `AdminUsuariosFormComponent` |
| `/admin/entidades` | `AdminEntidadesComponent` |
| `/admin/entidades/nueva` | `AdminEntidadesFormComponent` |
| `/admin/unidades` | `AdminUnidadesComponent` |
| `/admin/auditoria` | `AdminAuditoriaComponent` |

---

## Reglas de arquitectura

| Carpeta | Criterio |
|---|---|
| `shared/ui/` | Componentes presentacionales sin HTTP ni lógica SIAF |
| `shared/components/` | Componentes transversales con lógica compartida entre módulos |
| `layout/` | Componentes exclusivos del shell |
| `modules/[modulo]/` | Features por dominio — contabilidad, presupuesto, etc. |
| `modules/admin/` | Pantallas de administración del sistema |
| `features/` | Solo páginas públicas (login, otp, showcase) |

- Los módulos no se importan entre sí
- Si algo se necesita en dos módulos, sube a `shared/components/`
- `shared/ui/` nunca importa desde capas superiores
- Cada módulo futuro se agrega en `modules/`

---

## Tokens y estilos

Cascada de tokens en este orden:

1. `src/styles/tokens/base.css` — aliases estables
2. `src/styles/tokens/figma.css` — variables exportadas desde Figma
3. `src/styles/tokens/generated/tailwind.tokens.css` — puente Tailwind
4. `src/styles/tokens/themes/index.css` — light y dark

Reglas:
- No usar hexadecimales ni sombras hardcodeadas en componentes
- Usar tokens `--sys-*` o clases Tailwind conectadas a tokens

---

## Documentación

| Documento | Contenido |
|---|---|
| `docs/reglas-negocio-siaf.md` | Reglas de negocio completas por módulo |
| `docs/propuesta-modelo-sql-siaf.md` | Propuesta SQL original del modelo de datos |
| `docs/guia-implementacion-pantallas-siaf.md` | Reglas de construcción de pantallas Angular |
| `docs/plantilla-prompts-pantallas-siaf.md` | Plantillas para desarrollar nuevas pantallas |
| `docs/RESTRUCTURACION_REALIZADA.md` | Historial de cambios arquitecturales |
