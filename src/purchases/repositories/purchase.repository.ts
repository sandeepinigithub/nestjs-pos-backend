import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PurchaseOrder,
  Supplier,
  GRN,
  Prisma,
  PurchaseOrderStatus,
  DeliveryStatus,
  GRNStatus,
} from '@prisma/client';

@Injectable()
export class PurchaseRepository {
  constructor(private prisma: PrismaService) {}

  // Purchase Orders
  async findPurchaseOrderById(id: string): Promise<PurchaseOrder | null> {
    return this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        store: true,
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        grns: true,
      },
    });
  }

  async findPurchaseOrderByNumber(orderNumber: string): Promise<PurchaseOrder | null> {
    return this.prisma.purchaseOrder.findUnique({
      where: { orderNumber },
      include: {
        supplier: true,
        store: true,
        items: true,
      },
    });
  }

  async findPurchaseOrders(params: {
    where?: Prisma.PurchaseOrderWhereInput;
    include?: Prisma.PurchaseOrderInclude;
    orderBy?: Prisma.PurchaseOrderOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }): Promise<PurchaseOrder[]> {
    return this.prisma.purchaseOrder.findMany(params);
  }

  async createPurchaseOrder(data: Prisma.PurchaseOrderCreateInput): Promise<PurchaseOrder> {
    return this.prisma.purchaseOrder.create({
      data,
      include: {
        supplier: true,
        store: true,
        items: true,
      },
    });
  }

  async updatePurchaseOrder(
    id: string,
    data: Prisma.PurchaseOrderUpdateInput,
  ): Promise<PurchaseOrder> {
    return this.prisma.purchaseOrder.update({
      where: { id },
      data,
      include: {
        supplier: true,
        store: true,
        items: true,
      },
    });
  }

  async deletePurchaseOrder(id: string): Promise<PurchaseOrder> {
    return this.prisma.purchaseOrder.delete({
      where: { id },
    });
  }

  async countPurchaseOrders(where?: Prisma.PurchaseOrderWhereInput): Promise<number> {
    return this.prisma.purchaseOrder.count({ where });
  }

  async getNextPurchaseOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `PO-${year}-`;
    const last = await this.prisma.purchaseOrder.findFirst({
      where: { orderNumber: { startsWith: prefix } },
      orderBy: { orderNumber: 'desc' },
      select: { orderNumber: true },
    });
    let seq = 1;
    if (last?.orderNumber) {
      const match = last.orderNumber.slice(prefix.length);
      const n = parseInt(match, 10);
      if (!Number.isNaN(n)) seq = n + 1;
    }
    return `${prefix}${seq.toString().padStart(4, '0')}`;
  }

  // Suppliers
  async findSupplierById(id: string): Promise<Supplier | null> {
    return this.prisma.supplier.findUnique({
      where: { id },
    });
  }

  async findSuppliers(params: {
    where?: Prisma.SupplierWhereInput;
    orderBy?: Prisma.SupplierOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }): Promise<Supplier[]> {
    return this.prisma.supplier.findMany(params);
  }

  async createSupplier(data: Prisma.SupplierCreateInput): Promise<Supplier> {
    return this.prisma.supplier.create({ data });
  }

  async updateSupplier(
    id: string,
    data: Prisma.SupplierUpdateInput,
  ): Promise<Supplier> {
    return this.prisma.supplier.update({
      where: { id },
      data,
    });
  }

  async deleteSupplier(id: string): Promise<Supplier> {
    return this.prisma.supplier.delete({
      where: { id },
    });
  }

  async countSuppliers(where?: Prisma.SupplierWhereInput): Promise<number> {
    return this.prisma.supplier.count({ where });
  }

  async getNextSupplierCode(): Promise<string> {
    const prefix = 'SUP';
    const last = await this.prisma.supplier.findFirst({
      where: { code: { startsWith: prefix } },
      orderBy: { code: 'desc' },
      select: { code: true },
    });
    let seq = 1;
    if (last?.code) {
      const match = last.code.replace(prefix, '').replace(/^0+/, '') || '0';
      const n = parseInt(match, 10);
      if (!Number.isNaN(n)) seq = n + 1;
    }
    return `${prefix}${seq.toString().padStart(4, '0')}`;
  }

  // Analytics methods
  async getPurchaseSummary(
    startDate: Date,
    endDate: Date,
    storeId?: string,
  ): Promise<any[]> {
    const where: any = {
      orderDate: {
        gte: startDate,
        lte: endDate,
      },
    };
    if (storeId) where.storeId = storeId;

    return this.prisma.purchaseOrder.findMany({
      where,
      include: {
        supplier: true,
        store: true,
        items: true,
      },
    });
  }

  async getOpenPurchaseOrders(storeId?: string): Promise<any[]> {
    const where: any = {
      status: {
        in: [
          PurchaseOrderStatus.APPROVED,
          PurchaseOrderStatus.ORDERED,
          PurchaseOrderStatus.PARTIALLY_RECEIVED,
        ],
      },
    };
    if (storeId) where.storeId = storeId;

    return this.prisma.purchaseOrder.findMany({
      where,
      include: {
        supplier: true,
        store: true,
        items: true,
      },
      orderBy: { orderDate: 'desc' },
    });
  }

  async getPendingApprovals(storeId?: string): Promise<any[]> {
    const where: any = {
      status: PurchaseOrderStatus.PENDING_APPROVAL,
      requiresApproval: true,
    };
    if (storeId) where.storeId = storeId;

    return this.prisma.purchaseOrder.findMany({
      where,
      include: {
        supplier: true,
        store: true,
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSupplierWisePurchases(
    startDate: Date,
    endDate: Date,
    storeId?: string,
  ): Promise<any[]> {
    const where: any = {
      orderDate: {
        gte: startDate,
        lte: endDate,
      },
    };
    if (storeId) where.storeId = storeId;

    const orders = await this.prisma.purchaseOrder.findMany({
      where,
      include: {
        supplier: true,
        items: true,
      },
    });

    // Group by supplier
    const supplierMap = new Map();
    orders.forEach((order) => {
      const supplierId = order.supplierId;
      if (!supplierMap.has(supplierId)) {
        supplierMap.set(supplierId, {
          supplierId,
          supplierName: order.supplier.name,
          orders: [],
          totalValue: 0,
        });
      }
      const supplier = supplierMap.get(supplierId);
      supplier.orders.push(order);
      supplier.totalValue += Number(order.totalAmount);
    });

    return Array.from(supplierMap.values()).map((supplier: any) => ({
      supplierId: supplier.supplierId,
      supplierName: supplier.supplierName,
      totalOrders: supplier.orders.length,
      totalPurchaseValue: supplier.totalValue,
      averageOrderValue: supplier.totalValue / supplier.orders.length,
      lastOrderDate: supplier.orders
        .map((o: any) => o.orderDate)
        .sort()
        .reverse()[0],
    }));
  }

  async getCategoryWiseProcurement(
    startDate: Date,
    endDate: Date,
    storeId?: string,
  ): Promise<any[]> {
    const where: any = {
      orderDate: {
        gte: startDate,
        lte: endDate,
      },
    };
    if (storeId) where.storeId = storeId;

    const orders = await this.prisma.purchaseOrder.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    // Group by category
    const categoryMap = new Map();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const categoryId = item.product.categoryId;
        const categoryName = item.product.category.name;
        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, {
            categoryId,
            categoryName,
            totalQuantity: 0,
            totalValue: 0,
            orders: new Set(),
            items: [],
          });
        }
        const category = categoryMap.get(categoryId);
        category.totalQuantity += item.quantity;
        category.totalValue += Number(item.totalPrice);
        category.orders.add(order.id);
        category.items.push(item);
      });
    });

    return Array.from(categoryMap.values()).map((category: any) => ({
      categoryId: category.categoryId,
      categoryName: category.categoryName,
      totalQuantity: category.totalQuantity,
      totalValue: category.totalValue,
      totalOrders: category.orders.size,
      averageUnitPrice:
        category.totalQuantity > 0 ? category.totalValue / category.totalQuantity : 0,
    }));
  }

  async getDeliveryStatus(storeId?: string): Promise<any[]> {
    const where: any = {};
    if (storeId) where.storeId = storeId;

    const orders = await this.prisma.purchaseOrder.findMany({
      where,
      include: {
        supplier: true,
        store: true,
      },
    });

    // Group by delivery status
    const statusMap = new Map();
    orders.forEach((order) => {
      const status = order.deliveryStatus;
      if (!statusMap.has(status)) {
        statusMap.set(status, {
          status,
          count: 0,
          totalValue: 0,
          orders: [],
        });
      }
      const statusGroup = statusMap.get(status);
      statusGroup.count++;
      statusGroup.totalValue += Number(order.totalAmount);
      statusGroup.orders.push(order);
    });

    return Array.from(statusMap.values());
  }

  async getGRNStatus(storeId?: string): Promise<any[]> {
    const where: any = {};
    if (storeId) where.storeId = storeId;

    return this.prisma.gRN.findMany({
      where,
      include: {
        purchaseOrder: true,
        items: true,
        store: true,
      },
      orderBy: { receivedDate: 'desc' },
    });
  }
}
