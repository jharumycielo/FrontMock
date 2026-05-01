import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { PermissionService } from './permission.service';
import { RoleRouteData } from './role.model';

export const roleGuard: CanActivateFn = (route) => {
  const permissions = inject(PermissionService);
  const router = inject(Router);
  const data = route.data as RoleRouteData;

  if (permissions.hasRole(data.roles) && permissions.canAny(data.permissions)) {
    return true;
  }

  return router.parseUrl('/panel');
};
