import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Order, Prisma, OrderStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class OrderRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Order | null> {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        store: true,
        customer: true,
        orderItems: {
          include: {
            product: true,
            tax: true,
          },
        },
        payments: true,
      },
    });
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return this.prisma.order.findUnique({
      where: { orderNumber },
    });
  }

  async findMany(params: {
    where?: Prisma.OrderWhereInput;
    include?: Prisma.OrderInclude;
    orderBy?: Prisma.OrderOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }): Promise<Order[]> {
    return this.prisma.order.findMany(params);
  }

  async create(data: Prisma.OrderCreateInput): Promise<Order> {
    return this.prisma.order.create({
      data,
      include: {
        store: true,
        customer: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async update(id: string, data: Prisma.OrderUpdateInput): Promise<Order> {
    return this.prisma.order.update({
      where: { id },
      data,
      include: {
        store: true,
        customer: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findByStore(storeId: string, params?: { skip?: number; take?: number }): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: { storeId },
      ...params,
      orderBy: { orderDate: 'desc' },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: { status },
    });
  }

  async count(where?: Prisma.OrderWhereInput): Promise<number> {
    return this.prisma.order.count({ where });
  }

  async generateOrderNumber(storeId: string): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const count = await this.count({
      storeId,
      orderDate: {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lt: new Date(date.setHours(23, 59, 59, 999)),
      },
    });
    return `ORD-${dateStr}-${String(count + 1).padStart(6, '0')}`;
  }
}

