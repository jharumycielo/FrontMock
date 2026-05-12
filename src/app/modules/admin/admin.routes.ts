import { Routes } from '@angular/router';

// Módulo de Administración — OGTI (ADMIN_SISTEMA) y ADMIN_ENTIDAD
export const ADMIN_ROUTES: Routes = [
  // ── Gestión de Usuarios ──────────────────────────────────────
  {
    path: 'usuarios',
    loadChildren: () =>
      import('./usuarios/usuarios.routes').then((m) => m.USUARIOS_ROUTES),
    data: { permissions: ['user.read'] }
  },
  // ── Gestión de Entidades ─────────────────────────────────────
  {
    path: 'entidades',
    loadChildren: () =>
      import('./entidades/entidades.routes').then((m) => m.ENTIDADES_ROUTES),
    data: { permissions: ['entity.create'] }
  },
  // ── Auditoría ────────────────────────────────────────────────
  {
    path: 'auditoria',
    loadChildren: () =>
      import('./auditoria/auditoria.routes').then((m) => m.AUDITORIA_ROUTES),
    data: { permissions: ['audit.read'] }
  },
  {
    path: 'unidades',
    loadComponent: () =>
      import('./unidades/pages/list/admin-unidades.component').then((m) => m.AdminUnidadesComponent),
    data: { permissions: ['entity.update'] }
  },
  // Redirect por defecto
  { path: '', redirectTo: 'usuarios', pathMatch: 'full' }
];
