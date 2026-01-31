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

  // Analytics methods
  async getInventoryValueByStore(storeId?: string): Promise<any[]> {
    const where: any = {};
    if (storeId) where.storeId = storeId;

    return this.prisma.inventory.findMany({
      where,
      include: {
        product: {
          include: {
            category: true,
          },
        },
        store: true,
      },
    });
  }

  async getInventoryValueByCategory(categoryId?: string, storeId?: string): Promise<any[]> {
    const where: any = {};
    if (storeId) where.storeId = storeId;
    if (categoryId) {
      where.product = { categoryId };
    }

    return this.prisma.inventory.findMany({
      where,
      include: {
        product: {
          include: {
            category: true,
          },
        },
        store: true,
      },
    });
  }

  async getStockAlerts(storeId?: string): Promise<any[]> {
    const where: any = {};
    if (storeId) where.storeId = storeId;

    return this.prisma.inventory.findMany({
      where: {
        ...where,
        OR: [
          { reorderLevel: { not: null } },
          { availableQuantity: { lte: 0 } },
        ],
      },
      include: {
        product: true,
        store: true,
      },
    });
  }

  async getMovementAnalysis(
    days: number = 30,
    storeId?: string,
  ): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const where: any = {
      createdAt: { gte: startDate },
    };

    if (storeId) {
      where.inventory = { storeId };
    }

    const movements = await this.prisma.inventoryMovement.groupBy({
      by: ['inventoryId'],
      where,
      _sum: {
        quantity: true,
      },
      _count: {
        id: true,
      },
    });

    // Get inventory details
    const inventoryIds = movements.map((m) => m.inventoryId);
    const inventories = await this.prisma.inventory.findMany({
      where: {
        id: { in: inventoryIds },
        ...(storeId ? { storeId } : {}),
      },
      include: {
        product: true,
        store: true,
        movements: {
          where: {
            createdAt: { gte: startDate },
          },
        },
      },
    });

    return inventories;
  }

  async getStockAging(storeId?: string): Promise<any[]> {
    const where: any = {};
    if (storeId) where.storeId = storeId;

    return this.prisma.inventory.findMany({
      where,
      include: {
        product: true,
        store: true,
        movements: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async getDamagedBlockedStock(storeId?: string): Promise<any[]> {
    // Note: This assumes damaged/blocked stock is tracked via movements with specific reasons
    // You may need to add a separate table for this in the future
    const where: any = {
      movementType: { in: ['WASTE', 'ADJUSTMENT'] },
    };

    if (storeId) {
      where.inventory = { storeId };
    }

    const movements = await this.prisma.inventoryMovement.findMany({
      where,
      include: {
        inventory: {
          include: {
            product: true,
            store: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by inventory and calculate totals
    const grouped = movements.reduce((acc: any, movement) => {
      const invId = movement.inventoryId;
      if (!acc[invId]) {
        acc[invId] = {
          inventory: movement.inventory,
          damagedQuantity: 0,
          blockedQuantity: 0,
          movements: [],
        };
      }

      if (movement.reason?.toLowerCase().includes('damaged')) {
        acc[invId].damagedQuantity += Math.abs(movement.quantity);
      }
      if (movement.reason?.toLowerCase().includes('blocked')) {
        acc[invId].blockedQuantity += Math.abs(movement.quantity);
      }

      acc[invId].movements.push(movement);
      return acc;
    }, {});

    return Object.values(grouped);
  }
}

