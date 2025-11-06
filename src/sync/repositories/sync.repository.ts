import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SyncLog, Prisma, SyncStatus, SyncDirection } from '@prisma/client';

@Injectable()
export class SyncRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.SyncLogCreateInput): Promise<SyncLog> {
    return this.prisma.syncLog.create({
      data,
    });
  }

  async findById(id: string): Promise<SyncLog | null> {
    return this.prisma.syncLog.findUnique({
      where: { id },
      include: {
        store: true,
        region: true,
      },
    });
  }

  async findMany(params: {
    where?: Prisma.SyncLogWhereInput;
    orderBy?: Prisma.SyncLogOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }): Promise<SyncLog[]> {
    return this.prisma.syncLog.findMany(params);
  }

  async findByStore(storeId: string, params?: { skip?: number; take?: number }): Promise<SyncLog[]> {
    return this.prisma.syncLog.findMany({
      where: { storeId },
      ...params,
      orderBy: { startedAt: 'desc' },
      include: {
        store: true,
        region: true,
      },
    });
  }

  async update(id: string, data: Prisma.SyncLogUpdateInput): Promise<SyncLog> {
    return this.prisma.syncLog.update({
      where: { id },
      data,
    });
  }

  async count(where?: Prisma.SyncLogWhereInput): Promise<number> {
    return this.prisma.syncLog.count({ where });
  }
}

