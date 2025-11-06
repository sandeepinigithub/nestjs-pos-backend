import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Store, Prisma, StoreType, StoreStatus } from '@prisma/client';

@Injectable()
export class StoreRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Store | null> {
    return this.prisma.store.findUnique({
      where: { id },
      include: {
        country: true,
        region: true,
        parentStore: true,
        childStores: true,
      },
    });
  }

  async findByCode(code: string): Promise<Store | null> {
    return this.prisma.store.findUnique({
      where: { code },
    });
  }

  async findMany(params: {
    where?: Prisma.StoreWhereInput;
    include?: Prisma.StoreInclude;
    orderBy?: Prisma.StoreOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }): Promise<Store[]> {
    return this.prisma.store.findMany(params);
  }

  async create(data: Prisma.StoreCreateInput): Promise<Store> {
    return this.prisma.store.create({
      data,
      include: {
        country: true,
        region: true,
        parentStore: true,
      },
    });
  }

  async update(id: string, data: Prisma.StoreUpdateInput): Promise<Store> {
    return this.prisma.store.update({
      where: { id },
      data,
      include: {
        country: true,
        region: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.store.delete({
      where: { id },
    });
  }

  async findByRegion(regionId: string): Promise<Store[]> {
    return this.prisma.store.findMany({
      where: { regionId },
    });
  }

  async findByType(storeType: StoreType): Promise<Store[]> {
    return this.prisma.store.findMany({
      where: { storeType },
    });
  }

  async findByStatus(status: StoreStatus): Promise<Store[]> {
    return this.prisma.store.findMany({
      where: { status },
    });
  }

  async findChildren(parentId: string): Promise<Store[]> {
    return this.prisma.store.findMany({
      where: { parentStoreId: parentId },
    });
  }

  async count(where?: Prisma.StoreWhereInput): Promise<number> {
    return this.prisma.store.count({ where });
  }

  async updateSyncStatus(id: string, syncStatus: any, lastSyncAt?: Date): Promise<void> {
    await this.prisma.store.update({
      where: { id },
      data: {
        syncStatus,
        lastSyncAt: lastSyncAt || new Date(),
      },
    });
  }
}

