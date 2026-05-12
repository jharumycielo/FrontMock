import { Routes } from '@angular/router';

export const CONTABILIDAD_ROUTES: Routes = [
  {
    path: 'procesos/plan-cuentas-contables',
    loadChildren: () =>
      import('./plan-cuentas/plan-cuentas.routes').then((m) => m.PLAN_CUENTAS_ROUTES),
  },
  {
    path: 'procesos/registro-asiento-ajuste',
    loadChildren: () =>
      import('./asiento-ajuste/asiento-ajuste.routes').then((m) => m.ASIENTO_AJUSTE_ROUTES),
  },
];
