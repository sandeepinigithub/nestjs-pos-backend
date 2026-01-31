import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InventoryValueDto {
  @ApiProperty()
  storeId?: string;

  @ApiProperty()
  storeName?: string;

  @ApiProperty()
  categoryId?: string;

  @ApiProperty()
  categoryName?: string;

  @ApiProperty()
  totalValue: number;

  @ApiProperty()
  totalQuantity: number;

  @ApiProperty()
  averageUnitCost: number;
}

export class StockOnHandDto {
  @ApiProperty()
  productId: string;

  @ApiProperty()
  productCode: string;

  @ApiProperty()
  productName: string;

  @ApiPropertyOptional()
  variantId?: string;

  @ApiPropertyOptional()
  variantName?: string;

  @ApiProperty()
  sku: string;

  @ApiProperty()
  storeId: string;

  @ApiProperty()
  storeName: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  availableQuantity: number;

  @ApiProperty()
  reservedQuantity: number;

  @ApiPropertyOptional()
  unitCost?: number;

  @ApiPropertyOptional()
  totalValue?: number;
}

export class StockAlertDto {
  @ApiProperty()
  inventoryId: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  productCode: string;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  storeId: string;

  @ApiProperty()
  storeName: string;

  @ApiProperty()
  currentStock: number;

  @ApiProperty()
  reorderLevel: number;

  @ApiProperty()
  alertType: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK';

  @ApiProperty()
  daysUntilOutOfStock?: number;
}

export class MovementAnalysisDto {
  @ApiProperty()
  productId: string;

  @ApiProperty()
  productCode: string;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  totalMovements: number;

  @ApiProperty()
  totalQuantityIn: number;

  @ApiProperty()
  totalQuantityOut: number;

  @ApiProperty()
  movementType: 'FAST_MOVING' | 'SLOW_MOVING' | 'NORMAL';

  @ApiProperty()
  averageDailyMovement: number;
}

export class StockAgingDto {
  @ApiProperty()
  inventoryId: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  productCode: string;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  storeId: string;

  @ApiProperty()
  storeName: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  daysInInventory: number;

  @ApiProperty()
  agingCategory: 'NEW' | 'RECENT' | 'AGED' | 'VERY_AGED';

  @ApiPropertyOptional()
  lastMovementDate?: Date;
}

export class DamagedBlockedStockDto {
  @ApiProperty()
  inventoryId: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  productCode: string;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  storeId: string;

  @ApiProperty()
  storeName: string;

  @ApiProperty()
  damagedQuantity: number;

  @ApiProperty()
  blockedQuantity: number;

  @ApiProperty()
  totalAffected: number;

  @ApiPropertyOptional()
  reason?: string;

  @ApiPropertyOptional()
  notes?: string;
}

export class InventoryDashboardResponseDto {
  @ApiProperty({ type: [InventoryValueDto] })
  inventoryValue: InventoryValueDto[];

  @ApiProperty()
  totalInventoryValue: number;

  @ApiProperty({ type: [StockAlertDto] })
  stockAlerts: StockAlertDto[];

  @ApiProperty()
  lowStockCount: number;

  @ApiProperty()
  outOfStockCount: number;

  @ApiProperty()
  overstockCount: number;

  @ApiProperty({ type: [MovementAnalysisDto] })
  movementAnalysis: MovementAnalysisDto[];

  @ApiProperty({ type: [StockAgingDto] })
  stockAging: StockAgingDto[];

  @ApiProperty({ type: [DamagedBlockedStockDto] })
  damagedBlockedStock: DamagedBlockedStockDto[];

  @ApiProperty()
  summary: {
    totalProducts: number;
    totalStores: number;
    totalValue: number;
    totalQuantity: number;
    lowStockItems: number;
    outOfStockItems: number;
  };
}
