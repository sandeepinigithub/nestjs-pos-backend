import { Injectable } from '@nestjs/common';
import { PurchaseRepository } from '../repositories/purchase.repository';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PurchaseDashboardResponseDto,
  PurchaseSummaryDto,
  OpenPurchaseOrderDto,
  PendingApprovalDto,
  SupplierWisePurchaseDto,
  CategoryWiseProcurementDto,
  DeliveryStatusDto,
  PurchaseVsSalesTrendDto,
  TaxDiscountSummaryDto,
  GRNStatusDto,
} from '../dto/purchase-dashboard.dto';
import { PurchaseOrderStatus, DeliveryStatus } from '@prisma/client';

@Injectable()
export class PurchaseDashboardService {
  constructor(
    private purchaseRepository: PurchaseRepository,
    private prisma: PrismaService,
  ) {}

  async getDashboard(
    tenantId?: string,
    storeId?: string,
    period: 'DAILY' | 'WEEKLY' | 'MONTHLY' = 'MONTHLY',
  ): Promise<PurchaseDashboardResponseDto> {
    // Calculate date ranges
    const now = new Date();
    const { startDate, endDate } = this.getDateRange(period, now);

    // Get purchase summary
    const purchaseSummary = await this.getPurchaseSummary(startDate, endDate, storeId, tenantId);

    // Get open purchase orders
    const openPurchaseOrders = await this.getOpenPurchaseOrders(storeId, tenantId);

    // Get pending approvals
    const pendingApprovals = await this.getPendingApprovals(storeId, tenantId);

    // Get supplier-wise purchases
    const supplierWisePurchases = await this.getSupplierWisePurchases(
      startDate,
      endDate,
      storeId,
      tenantId,
    );

    // Get category-wise procurement
    const categoryWiseProcurement = await this.getCategoryWiseProcurement(
      startDate,
      endDate,
      storeId,
      tenantId,
    );

    // Get delivery status
    const deliveryStatus = await this.getDeliveryStatus(storeId, tenantId);

    // Get purchase vs sales trend
    const purchaseVsSalesTrend = await this.getPurchaseVsSalesTrend(
      startDate,
      endDate,
      storeId,
      tenantId,
    );

    // Get tax & discount summary
    const taxDiscountSummary = await this.getTaxDiscountSummary(
      startDate,
      endDate,
      storeId,
      tenantId,
    );

    // Get GRN status
    const grnStatus = await this.getGRNStatus(storeId, tenantId);

    // Calculate summary
    const allOrders = await this.purchaseRepository.findPurchaseOrders({
      where: {
        ...(storeId ? { storeId } : {}),
        ...(tenantId
          ? {
              store: {
                tenantId,
              },
            }
          : {}),
      },
    });

    const summary = {
      totalPurchaseOrders: allOrders.length,
      totalPurchaseValue: allOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0),
      openOrders: openPurchaseOrders.length,
      pendingApprovals: pendingApprovals.length,
      completedOrders: allOrders.filter(
        (o) => o.status === PurchaseOrderStatus.RECEIVED,
      ).length,
      cancelledOrders: allOrders.filter(
        (o) => o.status === PurchaseOrderStatus.CANCELLED,
      ).length,
    };

    return {
      purchaseSummary,
      openPurchaseOrders,
      openOrdersCount: openPurchaseOrders.length,
      pendingApprovals,
      pendingApprovalsCount: pendingApprovals.length,
      supplierWisePurchases,
      categoryWiseProcurement,
      deliveryStatus,
      purchaseVsSalesTrend,
      taxDiscountSummary,
      grnStatus,
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

  async getPurchaseSummary(
    startDate: Date,
    endDate: Date,
    storeId?: string,
    tenantId?: string,
  ): Promise<PurchaseSummaryDto[]> {
    const orders = await this.purchaseRepository.getPurchaseSummary(startDate, endDate, storeId);

    // Group by period (daily, weekly, monthly)
    const periodMap = new Map<string, PurchaseSummaryDto>();

    orders.forEach((order) => {
      const orderDate = new Date(order.orderDate);
      const dateKey = orderDate.toISOString().split('T')[0];

      if (!periodMap.has(dateKey)) {
        periodMap.set(dateKey, {
          period: 'DAILY',
          date: dateKey,
          totalOrders: 0,
          totalAmount: 0,
          totalTax: 0,
          totalDiscount: 0,
          netAmount: 0,
        });
      }

      const period = periodMap.get(dateKey)!;
      period.totalOrders++;
      period.totalAmount += Number(order.totalAmount);
      period.totalTax += Number(order.taxAmount);
      period.totalDiscount += Number(order.discountAmount);
      period.netAmount += Number(order.totalAmount) - Number(order.discountAmount);
    });

    return Array.from(periodMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  async getOpenPurchaseOrders(
    storeId?: string,
    tenantId?: string,
  ): Promise<OpenPurchaseOrderDto[]> {
    const orders = await this.purchaseRepository.getOpenPurchaseOrders(storeId);

    return orders.map((order) => {
      const orderDate = new Date(order.orderDate);
      const now = new Date();
      const daysPending = Math.floor(
        (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        supplierId: order.supplierId,
        supplierName: order.supplier.name,
        storeId: order.storeId,
        storeName: order.store.name,
        status: order.status,
        orderDate: order.orderDate,
        expectedDeliveryDate: order.expectedDeliveryDate || undefined,
        totalAmount: Number(order.totalAmount),
        deliveryStatus: order.deliveryStatus,
        daysPending,
      };
    });
  }

  async getPendingApprovals(
    storeId?: string,
    tenantId?: string,
  ): Promise<PendingApprovalDto[]> {
    const orders = await this.purchaseRepository.getPendingApprovals(storeId);

    return orders.map((order) => {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      const daysPending = Math.floor(
        (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        supplierName: order.supplier.name,
        storeName: order.store.name,
        totalAmount: Number(order.totalAmount),
        orderDate: order.orderDate,
        daysPending,
        requestedBy: order.createdByUser
          ? `${order.createdByUser.firstName} ${order.createdByUser.lastName}`
          : undefined,
      };
    });
  }

  async getSupplierWisePurchases(
    startDate: Date,
    endDate: Date,
    storeId?: string,
    tenantId?: string,
  ): Promise<SupplierWisePurchaseDto[]> {
    return this.purchaseRepository.getSupplierWisePurchases(startDate, endDate, storeId);
  }

  async getCategoryWiseProcurement(
    startDate: Date,
    endDate: Date,
    storeId?: string,
    tenantId?: string,
  ): Promise<CategoryWiseProcurementDto[]> {
    return this.purchaseRepository.getCategoryWiseProcurement(startDate, endDate, storeId);
  }

  async getDeliveryStatus(
    storeId?: string,
    tenantId?: string,
  ): Promise<DeliveryStatusDto[]> {
    const statusData = await this.purchaseRepository.getDeliveryStatus(storeId);

    return statusData.map((status) => ({
      status: status.status,
      count: status.count,
      totalValue: status.totalValue,
      orders: status.orders.map((order: any) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        supplierId: order.supplierId,
        supplierName: order.supplier.name,
        storeId: order.storeId,
        storeName: order.store.name,
        status: order.status,
        orderDate: order.orderDate,
        expectedDeliveryDate: order.expectedDeliveryDate || undefined,
        totalAmount: Number(order.totalAmount),
        deliveryStatus: order.deliveryStatus,
        daysPending: 0,
      })),
    }));
  }

  async getPurchaseVsSalesTrend(
    startDate: Date,
    endDate: Date,
    storeId?: string,
    tenantId?: string,
  ): Promise<PurchaseVsSalesTrendDto[]> {
    // Get purchases
    const purchases = await this.purchaseRepository.getPurchaseSummary(startDate, endDate, storeId);

    // Get sales (from orders)
    const salesWhere: any = {
      orderDate: {
        gte: startDate,
        lte: endDate,
      },
      paymentStatus: 'COMPLETED',
    };
    if (storeId) salesWhere.storeId = storeId;
    if (tenantId) {
      salesWhere.store = { tenantId };
    }

    const sales = await this.prisma.order.findMany({
      where: salesWhere,
      select: {
        orderDate: true,
        totalAmount: true,
      },
    });

    // Group by date
    const purchaseMap = new Map<string, number>();
    purchases.forEach((purchase) => {
      const dateKey = new Date(purchase.orderDate).toISOString().split('T')[0];
      purchaseMap.set(dateKey, (purchaseMap.get(dateKey) || 0) + Number(purchase.totalAmount));
    });

    const salesMap = new Map<string, number>();
    sales.forEach((sale) => {
      const dateKey = new Date(sale.orderDate).toISOString().split('T')[0];
      salesMap.set(dateKey, (salesMap.get(dateKey) || 0) + Number(sale.totalAmount));
    });

    // Combine dates
    const allDates = new Set([...purchaseMap.keys(), ...salesMap.keys()]);
    const trend: PurchaseVsSalesTrendDto[] = Array.from(allDates)
      .sort()
      .map((date) => {
        const purchaseAmount = purchaseMap.get(date) || 0;
        const salesAmount = salesMap.get(date) || 0;
        const difference = salesAmount - purchaseAmount;
        const percentageDifference =
          purchaseAmount > 0 ? (difference / purchaseAmount) * 100 : 0;

        return {
          date,
          purchaseAmount,
          salesAmount,
          difference,
          percentageDifference,
        };
      });

    return trend;
  }

  async getTaxDiscountSummary(
    startDate: Date,
    endDate: Date,
    storeId?: string,
    tenantId?: string,
  ): Promise<TaxDiscountSummaryDto> {
    const orders = await this.purchaseRepository.getPurchaseSummary(startDate, endDate, storeId);

    let totalTax = 0;
    let totalDiscount = 0;
    const taxByType = new Map<string, number>();
    const discountByType = new Map<string, number>();

    orders.forEach((order) => {
      totalTax += Number(order.taxAmount);
      totalDiscount += Number(order.discountAmount);

      // Group tax by type (simplified - you may need to enhance this based on tax structure)
      order.items?.forEach((item: any) => {
        if (item.taxRate) {
          const taxType = `TAX_${item.taxRate}%`;
          taxByType.set(taxType, (taxByType.get(taxType) || 0) + Number(item.taxAmount));
        }
      });

      // Group discount by type (simplified)
      if (Number(order.discountAmount) > 0) {
        discountByType.set('PURCHASE_DISCOUNT', (discountByType.get('PURCHASE_DISCOUNT') || 0) + Number(order.discountAmount));
      }
    });

    return {
      totalTax,
      totalDiscount,
      taxByType: Array.from(taxByType.entries()).map(([type, amount]) => ({
        type,
        amount,
      })),
      discountByType: Array.from(discountByType.entries()).map(([type, amount]) => ({
        type,
        amount,
      })),
    };
  }

  async getGRNStatus(storeId?: string, tenantId?: string): Promise<GRNStatusDto[]> {
    const grns = await this.purchaseRepository.getGRNStatus(storeId);

    return grns.map((grn) => {
      const totalItems = grn.items.length;
      const itemsReceived = grn.items.reduce(
        (sum, item) => sum + item.quantityReceived,
        0,
      );
      const itemsPending = totalItems - itemsReceived;
      const completionPercentage = totalItems > 0 ? (itemsReceived / totalItems) * 100 : 0;

      return {
        grnId: grn.id,
        grnNumber: grn.grnNumber,
        purchaseOrderNumber: grn.purchaseOrder.orderNumber,
        status: grn.status,
        receivedDate: grn.receivedDate,
        totalItems,
        itemsReceived,
        itemsPending,
        completionPercentage,
      };
    });
  }
}
