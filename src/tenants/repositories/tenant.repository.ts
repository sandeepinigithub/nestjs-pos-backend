import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Tenant, Prisma, TenantStatus, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class TenantRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Tenant | null> {
    return this.prisma.tenant.findUnique({
      where: { id },
      include: {
        stores: true,
        users: true,
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async findByCode(code: string): Promise<Tenant | null> {
    return this.prisma.tenant.findUnique({
      where: { code },
    });
  }

  async findByDomain(domain: string): Promise<Tenant | null> {
    return this.prisma.tenant.findUnique({
      where: { domain },
    });
  }

  async findMany(params: {
    where?: Prisma.TenantWhereInput;
    include?: Prisma.TenantInclude;
    orderBy?: Prisma.TenantOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }): Promise<Tenant[]> {
    return this.prisma.tenant.findMany(params);
  }

  async create(data: Prisma.TenantCreateInput): Promise<Tenant> {
    return this.prisma.tenant.create({
      data,
      include: {
        stores: true,
        users: true,
      },
    });
  }

  async update(id: string, data: Prisma.TenantUpdateInput): Promise<Tenant> {
    return this.prisma.tenant.update({
      where: { id },
      data,
      include: {
        stores: true,
        users: true,
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.tenant.delete({
      where: { id },
    });
  }

  async findByStatus(status: TenantStatus): Promise<Tenant[]> {
    return this.prisma.tenant.findMany({
      where: { status },
    });
  }

  async count(where?: Prisma.TenantWhereInput): Promise<number> {
    return this.prisma.tenant.count({ where });
  }

  async getTenantStats(tenantId: string): Promise<{
    totalUsers: number;
    totalStores: number;
    currentUsers: number;
    currentStores: number;
  }> {
    const [totalUsers, totalStores, currentUsers, currentStores] = await Promise.all([
      this.prisma.user.count({ where: { tenantId } }),
      this.prisma.store.count({ where: { tenantId } }),
      this.prisma.user.count({ where: { tenantId, status: 'ACTIVE' } }),
      this.prisma.store.count({ where: { tenantId, isActive: true } }),
    ]);

    return {
      totalUsers,
      totalStores,
      currentUsers,
      currentStores,
    };
  }
}
