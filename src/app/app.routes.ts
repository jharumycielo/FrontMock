import { Routes } from '@angular/router';

import { roleChildGuard } from './core/auth';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'login/recuperar-contrasena',
    loadComponent: () =>
      import('./features/otp-verification/otp-verification.component').then((m) => m.OtpVerificationComponent)
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/shell/app-shell.component').then((m) => m.AppShellComponent),
    canActivateChild: [roleChildGuard],
    children: [
      // ── Escritorio Virtual — portal central de todos los módulos ──
      {
        path: 'panel',
        loadChildren: () =>
          import('./layout/virtual-desk/virtual-desk.routes').then((m) => m.VIRTUAL_DESK_ROUTES),
        data: { permissions: ['document.read'] }
      },
      // ── Módulo: Administración (OGTI y ADMIN_ENTIDAD) ──
      {
        path: 'admin',
        loadChildren: () =>
          import('./modules/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
        data: { permissions: ['user.read'] }
      },
      // ── Módulo: Gestión Contable ──
      {
        path: '',
        loadChildren: () =>
          import('./modules/contabilidad/contabilidad.routes').then((m) => m.CONTABILIDAD_ROUTES),
        data: { permissions: ['document.read'] }
      },
    ]
  },
  {
    path: 'showcase',
    loadComponent: () =>
      import('./features/showcase/showcase.component').then((m) => m.ShowcaseComponent)
  },
  { path: '**', redirectTo: 'login' }
];
