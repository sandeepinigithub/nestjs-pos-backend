import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Inventory, InventoryMovement, Prisma, InventoryMovementType } from '@prisma/client';

@Injectable()
export class InventoryRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Inventory | null> {
    return this.prisma.inventory.findUnique({
      where: { id },
      include: {
        product: true,
        store: true,
      },
    });
  }

  async findByProductAndStore(productId: string, storeId: string): Promise<Inventory | null> {
    return this.prisma.inventory.findUnique({
      where: {
        productId_storeId: {
          productId,
          storeId,
        },
      },
      include: {
        product: true,
        store: true,
      },
    });
  }

  async findMany(params: {
    where?: Prisma.InventoryWhereInput;
    include?: Prisma.InventoryInclude;
    orderBy?: Prisma.InventoryOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }): Promise<Inventory[]> {
    return this.prisma.inventory.findMany(params);
  }

  async create(data: Prisma.InventoryCreateInput): Promise<Inventory> {
    return this.prisma.inventory.create({
      data,
      include: {
        product: true,
        store: true,
      },
    });
  }

  async update(id: string, data: Prisma.InventoryUpdateInput): Promise<Inventory> {
    return this.prisma.inventory.update({
      where: { id },
      data,
      include: {
        product: true,
        store: true,
      },
    });
  }

  async findByStore(storeId: string): Promise<Inventory[]> {
    return this.prisma.inventory.findMany({
      where: { storeId },
      include: {
        product: true,
      },
    });
  }

  async createMovement(data: Prisma.InventoryMovementCreateInput): Promise<InventoryMovement> {
    return this.prisma.inventoryMovement.create({
      data,
    });
  }

  async getMovements(inventoryId: string, params?: { skip?: number; take?: number }): Promise<InventoryMovement[]> {
    return this.prisma.inventoryMovement.findMany({
      where: { inventoryId },
      ...params,
      orderBy: { createdAt: 'desc' },
    });
  }

  async count(where?: Prisma.InventoryWhereInput): Promise<number> {
    return this.prisma.inventory.count({ where });
  }
}

