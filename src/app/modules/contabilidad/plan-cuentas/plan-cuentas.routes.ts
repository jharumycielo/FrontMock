import { Routes } from '@angular/router';

export const PLAN_CUENTAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/documents/chart-accounts-documents.component').then(
        (m) => m.ChartAccountsDocumentsComponent,
      ),
  },
  {
    path: 'solicitud',
    loadComponent: () =>
      import('./pages/request/chart-accounts-request.component').then(
        (m) => m.ChartAccountsRequestComponent,
      ),
  },
  {
    path: 'detalle/:id',
    loadComponent: () =>
      import('./pages/detail/chart-accounts-detail.component').then(
        (m) => m.ChartAccountsDetailComponent,
      ),
  },
  {
    path: 'carga-masiva/solicitud',
    loadComponent: () =>
      import('./pages/bulk-request/chart-accounts-bulk-request.component').then(
        (m) => m.ChartAccountsBulkRequestComponent,
      ),
  },
];
