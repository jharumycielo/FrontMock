import { Injectable, signal } from '@angular/core';

import { Permission, ROLE_PERMISSIONS, UserRole } from './role.model';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  // Demo role until authentication provides the real user profile.
  private readonly role = signal<UserRole>('creator');

  readonly currentRole = this.role.asReadonly();

  setRole(role: UserRole): void {
    this.role.set(role);
  }

  hasRole(roles: UserRole[] = []): boolean {
    return roles.length === 0 || roles.includes(this.currentRole());
  }

  can(permission: Permission): boolean {
    return ROLE_PERMISSIONS[this.currentRole()].includes(permission);
  }

  canAny(permissions: Permission[] = []): boolean {
    return permissions.length === 0 || permissions.some((permission) => this.can(permission));
  }
}
