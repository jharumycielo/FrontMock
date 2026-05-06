import { Routes } from '@angular/router';

import { roleChildGuard } from './core/auth';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'login/recuperar-contrasena',
    loadComponent: () => import('./features/otp-verification/otp-verification.component').then((m) => m.OtpVerificationComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell/app-shell.component').then((m) => m.AppShellComponent),
    canActivateChild: [roleChildGuard],
    children: [
      {
        path: 'panel',
        loadChildren: () =>
          import('./features/virtual-desk/virtual-desk.routes').then((m) => m.VIRTUAL_DESK_ROUTES),
        data: { permissions: ['document.read'] }
      },
      {
        path: 'procesos/registro-asiento-ajuste',
        loadChildren: () =>
          import('./features/adjustment-seat/adjustment-seat.routes').then((m) => m.ADJUSTMENT_SEAT_ROUTES),
        data: { permissions: ['document.read'] }
      },
      {
        path: 'procesos/plan-cuentas-contables',
        loadChildren: () =>
          import('./features/chart-accounts/chart-accounts.routes').then((m) => m.CHART_ACCOUNTS_ROUTES),
        data: { permissions: ['document.read'] }
      }
    ]
  },
  {
    path: 'showcase',
    loadComponent: () => import('./features/showcase/showcase.component').then((m) => m.ShowcaseComponent)
  },
  { path: '**', redirectTo: 'login' }
];
