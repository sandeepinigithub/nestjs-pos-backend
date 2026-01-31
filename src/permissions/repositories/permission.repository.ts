import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Permission, Prisma, PermissionResource, PermissionAction } from '@prisma/client';

@Injectable()
export class PermissionRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Permission | null> {
    return this.prisma.permission.findUnique({
      where: { id },
    });
  }

  async findByResourceAndAction(
    resource: PermissionResource,
    action: PermissionAction,
  ): Promise<Permission | null> {
    return this.prisma.permission.findUnique({
      where: {
        resource_action: {
          resource,
          action,
        },
      },
    });
  }

  async findMany(params: {
    where?: Prisma.PermissionWhereInput;
    orderBy?: Prisma.PermissionOrderByWithRelationInput;
  }): Promise<Permission[]> {
    return this.prisma.permission.findMany(params);
  }

  async create(data: Prisma.PermissionCreateInput): Promise<Permission> {
    return this.prisma.permission.create({
      data,
    });
  }

  async update(id: string, data: Prisma.PermissionUpdateInput): Promise<Permission> {
    return this.prisma.permission.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.permission.delete({
      where: { id },
    });
  }

  async findByModule(module: string): Promise<Permission[]> {
    return this.prisma.permission.findMany({
      where: { module: module as any },
    });
  }

  async count(where?: Prisma.PermissionWhereInput): Promise<number> {
    return this.prisma.permission.count({ where });
  }
}

