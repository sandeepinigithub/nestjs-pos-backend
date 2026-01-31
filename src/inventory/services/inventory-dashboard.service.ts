import { Injectable } from '@nestjs/common';
import { InventoryRepository } from '../repositories/inventory.repository';
import { PrismaService } from '../../prisma/prisma.service';
import {
  InventoryDashboardResponseDto,
  InventoryValueDto,
  StockAlertDto,
  MovementAnalysisDto,
  StockAgingDto,
  DamagedBlockedStockDto,
} from '../dto/inventory-dashboard.dto';

@Injectable()
export class InventoryDashboardService {
  constructor(
    private inventoryRepository: InventoryRepository,
    private prisma: PrismaService,
  ) {}

  async getDashboard(
    tenantId?: string,
    storeId?: string,
    categoryId?: string,
  ): Promise<InventoryDashboardResponseDto> {
    // Get inventory value
    const inventoryValue = await this.getInventoryValue(storeId, categoryId);

    // Get stock alerts
    const stockAlerts = await this.getStockAlerts(storeId);

    // Get movement analysis
    const movementAnalysis = await this.getMovementAnalysis(storeId);

    // Get stock aging
    const stockAging = await this.getStockAging(storeId);

    // Get damaged/blocked stock
    const damagedBlockedStock = await this.getDamagedBlockedStock(storeId);

    // Calculate summary
    const allInventory = await this.inventoryRepository.findMany({
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
      include: {
        product: {
          include: {
            category: true,
          },
        },
        store: true,
      },
    });

    const summary = {
      totalProducts: new Set(allInventory.map((inv) => inv.productId)).size,
      totalStores: new Set(allInventory.map((inv) => inv.storeId)).size,
      totalValue: inventoryValue.reduce((sum, iv) => sum + iv.totalValue, 0),
      totalQuantity: allInventory.reduce((sum, inv) => sum + inv.quantity, 0),
      lowStockItems: stockAlerts.filter((sa) => sa.alertType === 'LOW_STOCK').length,
      outOfStockItems: stockAlerts.filter((sa) => sa.alertType === 'OUT_OF_STOCK').length,
    };

    return {
      inventoryValue,
      totalInventoryValue: summary.totalValue,
      stockAlerts,
      lowStockCount: summary.lowStockItems,
      outOfStockCount: summary.outOfStockItems,
      overstockCount: stockAlerts.filter((sa) => sa.alertType === 'OVERSTOCK').length,
      movementAnalysis,
      stockAging,
      damagedBlockedStock,
      summary,
    };
  }

  async getInventoryValue(
    storeId?: string,
    categoryId?: string,
  ): Promise<InventoryValueDto[]> {
    let inventoryData: any[];

    if (categoryId) {
      inventoryData = await this.inventoryRepository.getInventoryValueByCategory(
        categoryId,
        storeId,
      );
    } else if (storeId) {
      inventoryData = await this.inventoryRepository.getInventoryValueByStore(storeId);
    } else {
      inventoryData = await this.inventoryRepository.getInventoryValueByStore();
    }

    // Group by store or category
    const grouped = new Map<string, InventoryValueDto>();

    inventoryData.forEach((inv) => {
      const key = categoryId
        ? `category_${inv.product.categoryId}`
        : `store_${inv.storeId}`;

      if (!grouped.has(key)) {
        grouped.set(key, {
          storeId: inv.storeId,
          storeName: inv.store.name,
          categoryId: inv.product.categoryId,
          categoryName: inv.product.category.name,
          totalValue: 0,
          totalQuantity: 0,
          averageUnitCost: 0,
        });
      }

      const item = grouped.get(key)!;
      const unitCost = inv.product.costPrice
        ? Number(inv.product.costPrice)
        : 0;
      const value = inv.quantity * unitCost;

      item.totalValue += value;
      item.totalQuantity += inv.quantity;
    });

    // Calculate averages
    Array.from(grouped.values()).forEach((item) => {
      if (item.totalQuantity > 0) {
        item.averageUnitCost = item.totalValue / item.totalQuantity;
      }
    });

    return Array.from(grouped.values());
  }

  async getStockAlerts(storeId?: string): Promise<StockAlertDto[]> {
    const inventoryData = await this.inventoryRepository.getStockAlerts(storeId);

    return inventoryData.map((inv) => {
      const currentStock = inv.availableQuantity;
      const reorderLevel = inv.reorderLevel || 0;
      let alertType: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK';
      let daysUntilOutOfStock: number | undefined;

      if (currentStock === 0) {
        alertType = 'OUT_OF_STOCK';
      } else if (currentStock <= reorderLevel) {
        alertType = 'LOW_STOCK';
        // Calculate days until out of stock based on average daily movement
        // This is a simplified calculation
        daysUntilOutOfStock = Math.ceil(currentStock / 10); // Assuming 10 units per day average
      } else if (inv.maxLevel && currentStock > inv.maxLevel) {
        alertType = 'OVERSTOCK';
      } else {
        alertType = 'LOW_STOCK'; // Default
      }

      return {
        inventoryId: inv.id,
        productId: inv.productId,
        productCode: inv.product.code,
        productName: inv.product.name,
        storeId: inv.storeId,
        storeName: inv.store.name,
        currentStock,
        reorderLevel,
        alertType,
        daysUntilOutOfStock,
      };
    });
  }

  async getMovementAnalysis(storeId?: string): Promise<MovementAnalysisDto[]> {
    const inventoryData = await this.inventoryRepository.getMovementAnalysis(30, storeId);

    return inventoryData.map((inv) => {
      const movements = inv.movements || [];
      const totalMovements = movements.length;
      const totalQuantityIn = movements
        .filter((m: any) => m.quantity > 0)
        .reduce((sum: number, m: any) => sum + m.quantity, 0);
      const totalQuantityOut = Math.abs(
        movements
          .filter((m: any) => m.quantity < 0)
          .reduce((sum: number, m: any) => sum + m.quantity, 0),
      );
      const averageDailyMovement = totalMovements / 30;

      let movementType: 'FAST_MOVING' | 'SLOW_MOVING' | 'NORMAL';
      if (averageDailyMovement > 5) {
        movementType = 'FAST_MOVING';
      } else if (averageDailyMovement < 1) {
        movementType = 'SLOW_MOVING';
      } else {
        movementType = 'NORMAL';
      }

      return {
        productId: inv.productId,
        productCode: inv.product.code,
        productName: inv.product.name,
        totalMovements,
        totalQuantityIn,
        totalQuantityOut,
        movementType,
        averageDailyMovement,
      };
    });
  }

  async getStockAging(storeId?: string): Promise<StockAgingDto[]> {
    const inventoryData = await this.inventoryRepository.getStockAging(storeId);

    return inventoryData.map((inv) => {
      const lastMovement = inv.movements?.[0];
      const lastMovementDate = lastMovement?.createdAt || inv.createdAt;
      const daysInInventory = Math.floor(
        (new Date().getTime() - new Date(lastMovementDate).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      let agingCategory: 'NEW' | 'RECENT' | 'AGED' | 'VERY_AGED';
      if (daysInInventory < 7) {
        agingCategory = 'NEW';
      } else if (daysInInventory < 30) {
        agingCategory = 'RECENT';
      } else if (daysInInventory < 90) {
        agingCategory = 'AGED';
      } else {
        agingCategory = 'VERY_AGED';
      }

      return {
        inventoryId: inv.id,
        productId: inv.productId,
        productCode: inv.product.code,
        productName: inv.product.name,
        storeId: inv.storeId,
        storeName: inv.store.name,
        quantity: inv.quantity,
        daysInInventory,
        agingCategory,
        lastMovementDate,
      };
    });
  }

  async getDamagedBlockedStock(storeId?: string): Promise<DamagedBlockedStockDto[]> {
    const data = await this.inventoryRepository.getDamagedBlockedStock(storeId);

    return data.map((item: any) => ({
      inventoryId: item.inventory.id,
      productId: item.inventory.productId,
      productCode: item.inventory.product.code,
      productName: item.inventory.product.name,
      storeId: item.inventory.storeId,
      storeName: item.inventory.store.name,
      damagedQuantity: item.damagedQuantity || 0,
      blockedQuantity: item.blockedQuantity || 0,
      totalAffected: (item.damagedQuantity || 0) + (item.blockedQuantity || 0),
      reason: item.movements[0]?.reason,
      notes: item.movements[0]?.notes,
    }));
  }

  async getStockOnHand(
    storeId?: string,
    productId?: string,
    sku?: string,
  ): Promise<any[]> {
    const where: any = {};
    if (storeId) where.storeId = storeId;
    if (productId) where.productId = productId;

    const inventory = await this.inventoryRepository.findMany({
      where,
      include: {
        product: {
          include: {
            category: true,
          },
        },
        store: true,
      },
    }) as any[];

    // Filter by SKU if provided
    let filtered = inventory;
    if (sku) {
      filtered = inventory.filter((inv: any) => inv.product?.code === sku);
    }

    return filtered.map((inv: any) => ({
      productId: inv.productId,
      productCode: inv.product?.code,
      productName: inv.product?.name,
      sku: inv.product?.code,
      storeId: inv.storeId,
      storeName: inv.store?.name,
      quantity: inv.quantity,
      availableQuantity: inv.availableQuantity,
      reservedQuantity: inv.reservedQuantity,
      unitCost: inv.product?.costPrice ? Number(inv.product.costPrice) : undefined,
      totalValue: inv.product?.costPrice
        ? Number(inv.product.costPrice) * inv.quantity
        : undefined,
    }));
  }
}
