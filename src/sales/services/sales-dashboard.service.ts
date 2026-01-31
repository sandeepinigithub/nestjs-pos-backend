import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  SalesDashboardResponseDto,
  SalesSummaryDto,
  RecentActivityDto,
  InventoryAlertDto,
  SalesAnalyticsDto,
} from '../dto/sales-dashboard.dto';
import { OrderStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class SalesDashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(
    tenantId?: string,
    storeId?: string,
    period: 'DAILY' | 'WEEKLY' | 'MONTHLY' = 'MONTHLY',
  ): Promise<SalesDashboardResponseDto> {
    const now = new Date();
    const { startDate, endDate } = this.getDateRange(period, now);

    // Get sales summary
    const salesSummary = await this.getSalesSummary(startDate, endDate, storeId, tenantId);

    // Get recent activity
    const recentActivity = await this.getRecentActivity(storeId, tenantId);

    // Get inventory alerts
    const inventoryAlerts = await this.getInventoryAlerts(storeId, tenantId);

    // Get analytics
    const analytics = await this.getAnalytics(startDate, endDate, storeId, tenantId);

    // Calculate summary
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(today);
    monthStart.setMonth(monthStart.getMonth() - 1);

    const [todayOrders, weekOrders, monthOrders] = await Promise.all([
      this.getOrdersSummary(today, new Date(), storeId, tenantId),
      this.getOrdersSummary(weekStart, new Date(), storeId, tenantId),
      this.getOrdersSummary(monthStart, new Date(), storeId, tenantId),
    ]);

    const summary = {
      todayRevenue: todayOrders.totalRevenue,
      todayOrders: todayOrders.totalOrders,
      weekRevenue: weekOrders.totalRevenue,
      weekOrders: weekOrders.totalOrders,
      monthRevenue: monthOrders.totalRevenue,
      monthOrders: monthOrders.totalOrders,
      averageOrderValue:
        monthOrders.totalOrders > 0
          ? monthOrders.totalRevenue / monthOrders.totalOrders
          : 0,
    };

    return {
      salesSummary,
      totalRevenue: salesSummary.reduce((sum, s) => sum + s.totalRevenue, 0),
      recentActivity,
      inventoryAlerts,
      lowStockCount: inventoryAlerts.filter((a) => a.alertType === 'LOW_STOCK').length,
      outOfStockCount: inventoryAlerts.filter((a) => a.alertType === 'OUT_OF_STOCK').length,
      analytics,
      summary,
    };
  }

  getDateRange(
    period: 'DAILY' | 'WEEKLY' | 'MONTHLY',
    referenceDate: Date,
  ): { startDate: Date; endDate: Date } {
    const endDate = new Date(referenceDate);
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date(referenceDate);
    switch (period) {
      case 'DAILY':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'WEEKLY':
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'MONTHLY':
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
    }

    return { startDate, endDate };
  }

  async getSalesSummary(
    startDate: Date,
    endDate: Date,
    storeId?: string,
    tenantId?: string,
  ): Promise<SalesSummaryDto[]> {
    const where: any = {
      orderDate: {
        gte: startDate,
        lte: endDate,
      },
      paymentStatus: PaymentStatus.COMPLETED,
    };
    if (storeId) where.storeId = storeId;
    if (tenantId) {
      where.store = { tenantId };
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        store: true,
        orderItems: true,
      },
    });

    // Group by date
    const dateMap = new Map<string, SalesSummaryDto>();

    orders.forEach((order) => {
      const dateKey = new Date(order.orderDate).toISOString().split('T')[0];

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {
          period: 'DAILY',
          date: dateKey,
          totalOrders: 0,
          totalRevenue: 0,
          totalTax: 0,
          totalDiscount: 0,
          netRevenue: 0,
          averageOrderValue: 0,
        });
      }

      const day = dateMap.get(dateKey)!;
      day.totalOrders++;
      day.totalRevenue += Number(order.totalAmount);
      day.totalTax += Number(order.taxAmount);
      day.totalDiscount += Number(order.discountAmount);
      day.netRevenue += Number(order.totalAmount) - Number(order.discountAmount);
    });

    // Calculate averages
    Array.from(dateMap.values()).forEach((day) => {
      if (day.totalOrders > 0) {
        day.averageOrderValue = day.totalRevenue / day.totalOrders;
      }
    });

    return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  async getRecentActivity(
    storeId?: string,
    tenantId?: string,
    limit: number = 20,
  ): Promise<RecentActivityDto[]> {
    const where: any = {};
    if (storeId) where.storeId = storeId;
    if (tenantId) {
      where.store = { tenantId };
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        createdByUser: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const activities: RecentActivityDto[] = [];

    orders.forEach((order) => {
      // Order creation
      activities.push({
        id: order.id,
        type: 'ORDER',
        orderNumber: order.orderNumber,
        description: `Order ${order.orderNumber} created`,
        amount: Number(order.totalAmount),
        timestamp: order.createdAt,
        user: order.createdByUser
          ? `${order.createdByUser.firstName} ${order.createdByUser.lastName}`
          : undefined,
      });

      // Payment activities
      order.payments.forEach((payment) => {
        if (payment.status === PaymentStatus.COMPLETED) {
          activities.push({
            id: payment.id,
            type: 'PAYMENT',
            orderNumber: order.orderNumber,
            description: `Payment received for order ${order.orderNumber}`,
            amount: Number(payment.amount),
            timestamp: payment.processedAt || payment.createdAt,
          });
        }
      });

      // Hold/Resume activities
      if (order.isHeld) {
        activities.push({
          id: `hold-${order.id}`,
          type: 'HOLD',
          orderNumber: order.orderNumber,
          description: `Order ${order.orderNumber} held`,
          timestamp: order.heldAt || order.createdAt,
        });
      }

      if (order.resumedAt) {
        activities.push({
          id: `resume-${order.id}`,
          type: 'RESUME',
          orderNumber: order.orderNumber,
          description: `Order ${order.orderNumber} resumed`,
          timestamp: order.resumedAt,
        });
      }

      // Cancellation
      if (order.cancelledAt) {
        activities.push({
          id: `cancel-${order.id}`,
          type: 'CANCELLATION',
          orderNumber: order.orderNumber,
          description: `Order ${order.orderNumber} cancelled`,
          timestamp: order.cancelledAt,
        });
      }
    });

    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getInventoryAlerts(
    storeId?: string,
    tenantId?: string,
  ): Promise<InventoryAlertDto[]> {
    const where: any = {};
    if (storeId) where.storeId = storeId;
    if (tenantId) {
      where.store = { tenantId };
    }

    const inventory = await this.prisma.inventory.findMany({
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

    return inventory
      .filter((inv) => {
        const reorderLevel = inv.reorderLevel || 0;
        const currentStock = inv.availableQuantity;
        return currentStock <= reorderLevel || (inv.maxLevel && currentStock > inv.maxLevel);
      })
      .map((inv) => {
        const reorderLevel = inv.reorderLevel || 0;
        const currentStock = inv.availableQuantity;
        let alertType: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK';
        let severity: 'HIGH' | 'MEDIUM' | 'LOW';

        if (currentStock === 0) {
          alertType = 'OUT_OF_STOCK';
          severity = 'HIGH';
        } else if (currentStock <= reorderLevel) {
          alertType = 'LOW_STOCK';
          severity = currentStock <= reorderLevel * 0.5 ? 'HIGH' : 'MEDIUM';
        } else {
          alertType = 'OVERSTOCK';
          severity = 'LOW';
        }

        return {
          productId: inv.productId,
          productCode: inv.product.code,
          productName: inv.product.name,
          currentStock,
          reorderLevel,
          alertType,
          severity,
        };
      });
  }

  async getAnalytics(
    startDate: Date,
    endDate: Date,
    storeId?: string,
    tenantId?: string,
  ): Promise<SalesAnalyticsDto> {
    const where: any = {
      orderDate: {
        gte: startDate,
        lte: endDate,
      },
      paymentStatus: PaymentStatus.COMPLETED,
    };
    if (storeId) where.storeId = storeId;
    if (tenantId) {
      where.store = { tenantId };
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        payments: true,
      },
    });

    // Calculate totals
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Top products
    const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const productId = item.productId;
        if (!productMap.has(productId)) {
          productMap.set(productId, {
            name: item.product.name,
            quantity: 0,
            revenue: 0,
          });
        }
        const product = productMap.get(productId)!;
        product.quantity += item.quantity;
        product.revenue += Number(item.totalPrice);
      });
    });

    const topProducts = Array.from(productMap.entries())
      .map(([productId, data]) => ({
        productId,
        productName: data.name,
        quantity: data.quantity,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Top categories
    const categoryMap = new Map<
      string,
      { name: string; revenue: number; orders: Set<string> }
    >();
    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const categoryId = item.product.categoryId;
        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, {
            name: item.product.category.name,
            revenue: 0,
            orders: new Set(),
          });
        }
        const category = categoryMap.get(categoryId)!;
        category.revenue += Number(item.totalPrice);
        category.orders.add(order.id);
      });
    });

    const topCategories = Array.from(categoryMap.entries())
      .map(([categoryId, data]) => ({
        categoryId,
        categoryName: data.name,
        revenue: data.revenue,
        orders: data.orders.size,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Payment method breakdown
    const paymentMethodMap = new Map<string, { count: number; amount: number }>();
    orders.forEach((order) => {
      order.payments.forEach((payment) => {
        const method = payment.paymentMethod;
        if (!paymentMethodMap.has(method)) {
          paymentMethodMap.set(method, { count: 0, amount: 0 });
        }
        const methodData = paymentMethodMap.get(method)!;
        methodData.count++;
        methodData.amount += Number(payment.amount);
      });
    });

    const paymentMethodBreakdown = Array.from(paymentMethodMap.entries()).map(
      ([method, data]) => ({
        method,
        count: data.count,
        amount: data.amount,
        percentage: totalRevenue > 0 ? (data.amount / totalRevenue) * 100 : 0,
      }),
    );

    // Order type breakdown
    const orderTypeMap = new Map<string, { count: number; amount: number }>();
    orders.forEach((order) => {
      const type = order.orderType || 'UNKNOWN';
      if (!orderTypeMap.has(type)) {
        orderTypeMap.set(type, { count: 0, amount: 0 });
      }
      const typeData = orderTypeMap.get(type)!;
      typeData.count++;
      typeData.amount += Number(order.totalAmount);
    });

    const orderTypeBreakdown = Array.from(orderTypeMap.entries()).map(([type, data]) => ({
      type,
      count: data.count,
      amount: data.amount,
      percentage: totalOrders > 0 ? (data.count / totalOrders) * 100 : 0,
    }));

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      topProducts,
      topCategories,
      paymentMethodBreakdown,
      orderTypeBreakdown,
    };
  }

  private async getOrdersSummary(
    startDate: Date,
    endDate: Date,
    storeId?: string,
    tenantId?: string,
  ): Promise<{ totalOrders: number; totalRevenue: number }> {
    const where: any = {
      orderDate: {
        gte: startDate,
        lte: endDate,
      },
      paymentStatus: PaymentStatus.COMPLETED,
    };
    if (storeId) where.storeId = storeId;
    if (tenantId) {
      where.store = { tenantId };
    }

    const orders = await this.prisma.order.findMany({
      where,
      select: {
        totalAmount: true,
      },
    });

    return {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
    };
  }
}
