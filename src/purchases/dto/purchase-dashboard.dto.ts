import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PurchaseSummaryDto {
  @ApiProperty()
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY';

  @ApiProperty()
  date: string;

  @ApiProperty()
  totalOrders: number;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  totalTax: number;

  @ApiProperty()
  totalDiscount: number;

  @ApiProperty()
  netAmount: number;
}

export class OpenPurchaseOrderDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderNumber: string;

  @ApiProperty()
  supplierId: string;

  @ApiProperty()
  supplierName: string;

  @ApiProperty()
  storeId: string;

  @ApiProperty()
  storeName: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  orderDate: Date;

  @ApiPropertyOptional()
  expectedDeliveryDate?: Date;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  deliveryStatus: string;

  @ApiProperty()
  daysPending: number;
}

export class PendingApprovalDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderNumber: string;

  @ApiProperty()
  supplierName: string;

  @ApiProperty()
  storeName: string;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  orderDate: Date;

  @ApiProperty()
  daysPending: number;

  @ApiPropertyOptional()
  requestedBy?: string;
}

export class SupplierWisePurchaseDto {
  @ApiProperty()
  supplierId: string;

  @ApiProperty()
  supplierName: string;

  @ApiProperty()
  totalOrders: number;

  @ApiProperty()
  totalPurchaseValue: number;

  @ApiProperty()
  averageOrderValue: number;

  @ApiProperty()
  lastOrderDate?: Date;
}

export class CategoryWiseProcurementDto {
  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  categoryName: string;

  @ApiProperty()
  totalQuantity: number;

  @ApiProperty()
  totalValue: number;

  @ApiProperty()
  totalOrders: number;

  @ApiProperty()
  averageUnitPrice: number;
}

export class DeliveryStatusDto {
  @ApiProperty()
  status: string;

  @ApiProperty()
  count: number;

  @ApiProperty()
  totalValue: number;

  @ApiProperty()
  orders: OpenPurchaseOrderDto[];
}

export class PurchaseVsSalesTrendDto {
  @ApiProperty()
  date: string;

  @ApiProperty()
  purchaseAmount: number;

  @ApiProperty()
  salesAmount: number;

  @ApiProperty()
  difference: number;

  @ApiProperty()
  percentageDifference: number;
}

export class TaxDiscountSummaryDto {
  @ApiProperty()
  totalTax: number;

  @ApiProperty()
  totalDiscount: number;

  @ApiProperty()
  taxByType: {
    type: string;
    amount: number;
  }[];

  @ApiProperty()
  discountByType: {
    type: string;
    amount: number;
  }[];
}

export class GRNStatusDto {
  @ApiProperty()
  grnId: string;

  @ApiProperty()
  grnNumber: string;

  @ApiProperty()
  purchaseOrderNumber: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  receivedDate: Date;

  @ApiProperty()
  totalItems: number;

  @ApiProperty()
  itemsReceived: number;

  @ApiProperty()
  itemsPending: number;

  @ApiProperty()
  completionPercentage: number;
}

export class PurchaseDashboardResponseDto {
  @ApiProperty({ type: [PurchaseSummaryDto] })
  purchaseSummary: PurchaseSummaryDto[];

  @ApiProperty({ type: [OpenPurchaseOrderDto] })
  openPurchaseOrders: OpenPurchaseOrderDto[];

  @ApiProperty()
  openOrdersCount: number;

  @ApiProperty({ type: [PendingApprovalDto] })
  pendingApprovals: PendingApprovalDto[];

  @ApiProperty()
  pendingApprovalsCount: number;

  @ApiProperty({ type: [SupplierWisePurchaseDto] })
  supplierWisePurchases: SupplierWisePurchaseDto[];

  @ApiProperty({ type: [CategoryWiseProcurementDto] })
  categoryWiseProcurement: CategoryWiseProcurementDto[];

  @ApiProperty({ type: [DeliveryStatusDto] })
  deliveryStatus: DeliveryStatusDto[];

  @ApiProperty({ type: [PurchaseVsSalesTrendDto] })
  purchaseVsSalesTrend: PurchaseVsSalesTrendDto[];

  @ApiProperty()
  taxDiscountSummary: TaxDiscountSummaryDto;

  @ApiProperty({ type: [GRNStatusDto] })
  grnStatus: GRNStatusDto[];

  @ApiProperty()
  summary: {
    totalPurchaseOrders: number;
    totalPurchaseValue: number;
    openOrders: number;
    pendingApprovals: number;
    completedOrders: number;
    cancelledOrders: number;
  };
}
