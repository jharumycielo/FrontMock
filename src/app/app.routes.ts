import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'login/recuperar-contrasena',
    loadComponent: () => import('./features/otp-verification/otp-verification.component').then((m) => m.OtpVerificationComponent)
  },
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
    redirectTo: 'procesos/plan-cuentas-contables',
    pathMatch: 'full'
  },
  {
    path: 'procesos/plan-cuentas-contables/carga-masiva/solicitud',
    redirectTo: 'procesos/plan-cuentas-contables',
    pathMatch: 'full'
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' }
];
