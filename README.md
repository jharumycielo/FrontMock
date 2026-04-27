# SIAF RP Angular + Tailwind

Base inicial para convertir el UI kit de Figma a componentes Angular reutilizables con Tailwind CSS.

## Stack

- Angular 20 con standalone components.
- Tailwind CSS 4 con PostCSS.
- Material Icons instalado por npm.
- Tokens CSS generados desde Figma con naming compatible con `sys/*` y `ref/*`.

## Requisitos

- Node.js `20.19.x` o superior dentro de la version 20.
- npm `10` o superior.

## Comandos

```bash
npm install
npm start
npm run build
```

La app local queda disponible en:

```txt
http://127.0.0.1:4200/
```

## Tokens de Figma

El JSON fuente vive en:

```txt
src/tokens/Value.tokens.json
```

Para regenerar las variables CSS desde ese JSON:

```bash
npm run tokens:build
```

El resultado generado queda en:

```txt
src/styles/figma-tokens.css
```

Ese archivo se importa desde `src/styles.css`.

## Instalacion limpia desde GitHub

```bash
git clone <repo-url>
cd siaf-angular-tailwind
npm install
npm run tokens:build
npm start
```

No se debe subir `node_modules`, `dist`, `.angular` ni logs. El `package-lock.json` si debe subirse para que todos instalen las mismas versiones.

## Estructura

```txt
src/
  app/
    shared/
      ui/
        accordion/
        action-tracker/
        alert/
        annulment-modal/
        badge/
        breadcrumb/
        button/
        card/
        checkbox/
        create-document/
        data-table/
        date-time-picker/
        divider/
        icon/
        input/
        list/
        loading-progress/
        menu/
        modal/
        navbar/
        pagination/
        popover/
        radio/
        readonly/
        side-panel/
        sidebar/
        snackbar/
        solicitude-header/
        steps/
        stepper-card/
        summary-card/
        switch/
        table/
        tag/
        tabs/
        text-field/
        timeline/
        tooltip/
        tree-view/
        uploader/
  styles.css
```

## Siguiente paso

Cuando tengas links directos a los frames de Figma, reemplazamos los valores de `src/styles.css` por tokens reales y ampliamos los componentes con las variantes del UI kit.
