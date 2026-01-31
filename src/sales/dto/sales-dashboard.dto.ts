import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SalesSummaryDto {
  @ApiProperty()
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY';

  @ApiProperty()
  date: string;

  @ApiProperty()
  totalOrders: number;

  @ApiProperty()
  totalRevenue: number;

  @ApiProperty()
  totalTax: number;

  @ApiProperty()
  totalDiscount: number;

  @ApiProperty()
  netRevenue: number;

  @ApiProperty()
  averageOrderValue: number;
}

export class RecentActivityDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  type: 'ORDER' | 'PAYMENT' | 'CANCELLATION' | 'HOLD' | 'RESUME';

  @ApiProperty()
  orderNumber?: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  amount?: number;

  @ApiProperty()
  timestamp: Date;

  @ApiProperty()
  user?: string;
}

export class InventoryAlertDto {
  @ApiProperty()
  productId: string;

  @ApiProperty()
  productCode: string;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  currentStock: number;

  @ApiProperty()
  reorderLevel: number;

  @ApiProperty()
  alertType: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK';

  @ApiProperty()
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

export class SalesAnalyticsDto {
  @ApiProperty()
  totalRevenue: number;

  @ApiProperty()
  totalOrders: number;

  @ApiProperty()
  averageOrderValue: number;

  @ApiProperty()
  topProducts: {
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }[];

  @ApiProperty()
  topCategories: {
    categoryId: string;
    categoryName: string;
    revenue: number;
    orders: number;
  }[];

  @ApiProperty()
  paymentMethodBreakdown: {
    method: string;
    count: number;
    amount: number;
    percentage: number;
  }[];

  @ApiProperty()
  orderTypeBreakdown: {
    type: string;
    count: number;
    amount: number;
    percentage: number;
  }[];
}

export class SalesDashboardResponseDto {
  @ApiProperty({ type: [SalesSummaryDto] })
  salesSummary: SalesSummaryDto[];

  @ApiProperty()
  totalRevenue: number;

  @ApiProperty({ type: [RecentActivityDto] })
  recentActivity: RecentActivityDto[];

  @ApiProperty({ type: [InventoryAlertDto] })
  inventoryAlerts: InventoryAlertDto[];

  @ApiProperty()
  lowStockCount: number;

  @ApiProperty()
  outOfStockCount: number;

  @ApiProperty()
  analytics: SalesAnalyticsDto;

  @ApiProperty()
  summary: {
    todayRevenue: number;
    todayOrders: number;
    weekRevenue: number;
    weekOrders: number;
    monthRevenue: number;
    monthOrders: number;
    averageOrderValue: number;
  };
}
