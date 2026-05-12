import { Routes } from '@angular/router';

export const USUARIOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/list/admin-usuarios.component').then((m) => m.AdminUsuariosComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/form/admin-usuarios-form.component').then((m) => m.AdminUsuariosFormComponent),
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./pages/form/admin-usuarios-form.component').then((m) => m.AdminUsuariosFormComponent),
  },
];
