import { SetMetadata } from '@nestjs/common';
import { PermissionResource, PermissionAction } from '@prisma/client';
import { PERMISSIONS_KEY } from '../guards/permission.guard';

export interface PermissionMetadata {
  resource: PermissionResource;
  action: PermissionAction;
}

export const RequirePermissions = (...permissions: PermissionMetadata[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

