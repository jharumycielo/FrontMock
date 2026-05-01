export type UserRole = 'creator' | 'reviewer' | 'approver';

export type Permission =
  | 'document.create'
  | 'document.edit'
  | 'document.delete'
  | 'document.verify'
  | 'document.review'
  | 'document.approve'
  | 'document.observe'
  | 'document.reject'
  | 'document.annul'
  | 'document.read';

export type RoleRouteData = {
  roles?: UserRole[];
  permissions?: Permission[];
};

export const ROLE_LABELS: Record<UserRole, string> = {
  creator: 'Creador',
  reviewer: 'Revisor',
  approver: 'Aprobador'
};

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  creator: ['document.create', 'document.edit', 'document.delete', 'document.verify', 'document.read'],
  reviewer: ['document.review', 'document.observe', 'document.read'],
  approver: ['document.approve', 'document.observe', 'document.reject', 'document.read']
};
