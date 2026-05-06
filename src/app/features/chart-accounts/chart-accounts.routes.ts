import { Routes } from '@angular/router';

export const CHART_ACCOUNTS_ROUTES: Routes = [
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
    path: 'carga-masiva/solicitud',
    redirectTo: '',
    pathMatch: 'full',
  },
];
