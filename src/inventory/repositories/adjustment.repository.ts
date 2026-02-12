import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  InventoryAdjustment,
  Prisma,
  AdjustmentStatus,
} from '@prisma/client';

@Injectable()
export class AdjustmentRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<InventoryAdjustment | null> {
    return this.prisma.inventoryAdjustment.findUnique({
      where: { id },
      include: {
        store: true,
        lines: {
          include: {
            product: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async findMany(params: {
    where?: Prisma.InventoryAdjustmentWhereInput;
    orderBy?: Prisma.InventoryAdjustmentOrderByWithRelationInput;
    skip?: number;
    take?: number;
    include?: Prisma.InventoryAdjustmentInclude;
  }): Promise<any[]> {
    return this.prisma.inventoryAdjustment.findMany({
      ...params,
      include: params.include ?? {
        store: true,
        lines: {
          include: {
            product: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async count(where?: Prisma.InventoryAdjustmentWhereInput): Promise<number> {
    return this.prisma.inventoryAdjustment.count({ where });
  }

  async getNextAdjustmentNumber(storeId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `ADJ-${year}-`;
    const last = await this.prisma.inventoryAdjustment.findFirst({
      where: {
        adjustmentNumber: { startsWith: prefix },
        storeId,
      },
      orderBy: { adjustmentNumber: 'desc' },
      select: { adjustmentNumber: true },
    });
    let seq = 1;
    if (last?.adjustmentNumber) {
      const match = last.adjustmentNumber.slice(prefix.length);
      const n = parseInt(match, 10);
      if (!Number.isNaN(n)) seq = n + 1;
    }
    return `${prefix}${seq.toString().padStart(4, '0')}`;
  }

  async create(data: Prisma.InventoryAdjustmentCreateInput): Promise<InventoryAdjustment> {
    return this.prisma.inventoryAdjustment.create({
      data,
      include: {
        store: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async update(
    id: string,
    data: Prisma.InventoryAdjustmentUpdateInput,
  ): Promise<InventoryAdjustment> {
    return this.prisma.inventoryAdjustment.update({
      where: { id },
      data,
      include: {
        store: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<InventoryAdjustment> {
    return this.prisma.inventoryAdjustment.delete({
      where: { id },
    });
  }
}
