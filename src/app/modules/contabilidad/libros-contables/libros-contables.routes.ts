import { Routes } from '@angular/router';

export const LIBROS_CONTABLES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/search/libros-contables-search.component').then(
        (m) => m.LibrosContablesSearchComponent,
      ),
  },
  {
    path: 'resultados',
    loadComponent: () =>
      import('./pages/list/accounting-books.component').then(
        (m) => m.AccountingBooksComponent,
      ),
  },
];
