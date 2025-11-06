import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionResource, PermissionAction } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export const PERMISSIONS_KEY = 'permissions';

export interface PermissionMetadata {
  resource: PermissionResource;
  action: PermissionAction;
}

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<PermissionMetadata[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No permissions required
    }

    const request = context.switchToHttp().getRequest();
    const user: UserResponseDto = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check each required permission
    for (const permission of requiredPermissions) {
      const hasPermission = await this.checkPermission(
        user.id,
        permission.resource,
        permission.action,
        request.query?.storeId || request.body?.storeId,
      );

      if (!hasPermission) {
        throw new ForbiddenException(
          `Insufficient permissions. Required: ${permission.resource}:${permission.action}`,
        );
      }
    }

    return true;
  }

  private async checkPermission(
    userId: string,
    resource: PermissionResource,
    action: PermissionAction,
    storeId?: string,
  ): Promise<boolean> {
    // Check direct user permissions
    const userPermission = await this.prisma.userPermission.findFirst({
      where: {
        userId,
        permission: {
          resource,
          action,
        },
        isAllowed: true,
        AND: [
          {
            OR: [
              { storeId: null }, // Global permission
              { storeId }, // Store-specific permission
            ],
          },
          {
            OR: [
              {
                expiresAt: {
                  gt: new Date(),
                },
              },
              {
                expiresAt: null,
              },
            ],
          },
        ],
      },
    });

    if (userPermission) {
      return true;
    }

    // Check group permissions
    const userGroups = await this.prisma.userGroup.findMany({
      where: {
        userId,
        OR: [
          { storeId: null },
          { storeId },
        ],
      },
      include: {
        group: {
          include: {
            groupPermissions: {
              where: {
                isAllowed: true,
                permission: {
                  resource,
                  action,
                },
              },
            },
          },
        },
      },
    });

    for (const userGroup of userGroups) {
      if (userGroup.group.groupPermissions.length > 0) {
        return true;
      }
    }

    // Check access permissions (store/region specific)
    if (storeId) {
      const store = await this.prisma.store.findUnique({
        where: { id: storeId },
        include: { region: true },
      });

      if (store) {
        const accessPermission = await this.prisma.accessPermission.findFirst({
          where: {
            permission: {
              resource,
              action,
            },
            isAllowed: true,
            OR: [
              { storeId },
              { regionId: store.regionId },
              { storeId: null, regionId: null }, // Global
            ],
          },
        });

        if (accessPermission) {
          return true;
        }
      }
    }

    return false;
  }
}

