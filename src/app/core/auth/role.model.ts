export type UserRole = 'creator' | 'reviewer' | 'approver' | 'admin_sistema' | 'admin_entidad';

export type Permission =
  // Documentos / Solicitudes
  | 'document.create'
  | 'document.edit'
  | 'document.delete'
  | 'document.verify'
  | 'document.review'
  | 'document.approve'
  | 'document.observe'
  | 'document.reject'
  | 'document.annul'
  | 'document.read'
  // Cuentas contables
  | 'chart_account.read'
  | 'chart_account.create'
  | 'chart_account.approve'
  // Usuarios
  | 'user.read'
  | 'user.create'
  | 'user.update'
  | 'user.disable'
  | 'role.assign'
  // Entidades
  | 'entity.create'
  | 'entity.update'
  | 'entity.manage'
  // Auditoría
  | 'audit.read'
  | 'audit.export'
  // Catálogo
  | 'doc_type.manage';

export type RoleRouteData = {
  roles?: UserRole[];
  permissions?: Permission[];
};

export const ROLE_LABELS: Record<UserRole, string> = {
  creator: 'Creador',
  reviewer: 'Revisor',
  approver: 'Aprobador',
  admin_sistema: 'Administrador del Sistema',
  admin_entidad: 'Administrador de Entidad'
};

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  creator: [
    'document.create', 'document.edit', 'document.delete',
    'document.verify', 'document.read',
    'chart_account.read', 'chart_account.create',
  ],
  reviewer: [
    'document.review', 'document.observe', 'document.read',
    'chart_account.read',
  ],
  approver: [
    'document.approve', 'document.observe', 'document.reject',
    'document.read', 'chart_account.read', 'chart_account.approve',
  ],
  admin_entidad: [
    'document.read', 'chart_account.read',
    'user.read', 'user.create', 'user.update', 'user.disable',
    'role.assign', 'entity.update',
    'audit.read',
  ],
  admin_sistema: [
    'document.read', 'chart_account.read', 'chart_account.approve',
    'user.read', 'user.create', 'user.update', 'user.disable',
    'role.assign',
    'entity.create', 'entity.update', 'entity.manage',
    'audit.read', 'audit.export',
    'doc_type.manage',
  ],
};
