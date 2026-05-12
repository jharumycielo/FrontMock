import { Routes } from '@angular/router';

export const ASIENTO_AJUSTE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/documents/adjustment-seat-documents.component').then(
        (m) => m.AdjustmentSeatDocumentsComponent,
      ),
  },
  {
    path: 'solicitud',
    loadComponent: () =>
      import('./pages/request/adjustment-seat-request.component').then(
        (m) => m.AdjustmentSeatRequestComponent,
      ),
  },
  {
    path: 'formulario',
    loadComponent: () =>
      import('./pages/form/adjustment-seat-form.component').then(
        (m) => m.AdjustmentSeatFormComponent,
      ),
  },
];
