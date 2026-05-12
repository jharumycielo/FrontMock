import { Routes } from '@angular/router';

export const ENTIDADES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/list/admin-entidades.component').then((m) => m.AdminEntidadesComponent),
  },
  {
    path: 'nueva',
    loadComponent: () =>
      import('./pages/form/admin-entidades-form.component').then((m) => m.AdminEntidadesFormComponent),
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./pages/form/admin-entidades-form.component').then((m) => m.AdminEntidadesFormComponent),
  },
  {
    path: ':id/unidades',
    loadComponent: () =>
      import('../unidades/pages/list/admin-unidades.component').then((m) => m.AdminUnidadesComponent),
  },
];
