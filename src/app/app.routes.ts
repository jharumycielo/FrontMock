import { Routes } from '@angular/router';

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
    children: [
      {
        path: 'panel',
        loadComponent: () => import('./features/virtual-desk/virtual-desk.component').then((m) => m.VirtualDeskComponent)
      },
      {
        path: 'procesos/registro-asiento-ajuste',
        loadComponent: () => import('./features/adjustment-seat-documents/adjustment-seat-documents.component').then((m) => m.AdjustmentSeatDocumentsComponent)
      },
      {
        path: 'procesos/registro-asiento-ajuste/solicitud',
        loadComponent: () => import('./features/adjustment-seat-request/adjustment-seat-request.component').then((m) => m.AdjustmentSeatRequestComponent)
      },
      {
        path: 'procesos/registro-asiento-ajuste/formulario',
        loadComponent: () => import('./features/adjustment-seat-form/adjustment-seat-form.component').then((m) => m.AdjustmentSeatFormComponent)
      },
      {
        path: 'procesos/plan-cuentas-contables',
        loadComponent: () => import('./features/chart-accounts-documents/chart-accounts-documents.component').then((m) => m.ChartAccountsDocumentsComponent)
      },
      {
        path: 'procesos/plan-cuentas-contables/solicitud',
        loadComponent: () => import('./features/chart-accounts-request/chart-accounts-request.component').then((m) => m.ChartAccountsRequestComponent)
      },
      {
        path: 'procesos/plan-cuentas-contables/carga-masiva/solicitud',
        redirectTo: 'procesos/plan-cuentas-contables',
        pathMatch: 'full'
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
