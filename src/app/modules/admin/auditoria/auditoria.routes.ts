import { Routes } from '@angular/router';

export const AUDITORIA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/list/admin-auditoria.component').then((m) => m.AdminAuditoriaComponent),
  },
];
