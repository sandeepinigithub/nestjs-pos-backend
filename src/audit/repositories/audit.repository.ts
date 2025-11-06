import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLog, Prisma, AuditAction } from '@prisma/client';

@Injectable()
export class AuditRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.AuditLogCreateInput): Promise<AuditLog> {
    return this.prisma.auditLog.create({
      data,
    });
  }

  async findMany(params: {
    where?: Prisma.AuditLogWhereInput;
    orderBy?: Prisma.AuditLogOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }): Promise<AuditLog[]> {
    return this.prisma.auditLog.findMany(params);
  }

  async findByUser(userId: string, params?: { skip?: number; take?: number }): Promise<AuditLog[]> {
    return this.prisma.auditLog.findMany({
      where: { userId },
      ...params,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByResource(resource: string, resourceId: string): Promise<AuditLog[]> {
    return this.prisma.auditLog.findMany({
      where: {
        resource,
        resourceId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async count(where?: Prisma.AuditLogWhereInput): Promise<number> {
    return this.prisma.auditLog.count({ where });
  }
}

