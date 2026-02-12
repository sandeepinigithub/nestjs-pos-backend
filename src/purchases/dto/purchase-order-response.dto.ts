import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PurchaseOrderItemDto {
  @ApiProperty()
  itemId: string;

  @ApiProperty()
  itemName: string;

  @ApiPropertyOptional()
  sku?: string;

  @ApiProperty()
  quantity: number;

  @ApiPropertyOptional()
  unit?: string;

  @ApiProperty()
  rate: number;

  @ApiProperty()
  amount: number;
}

export class PurchaseOrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderNumber: string;

  @ApiProperty()
  date: string;

  @ApiProperty()
  vendorId: string;

  @ApiProperty()
  vendorName: string;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional({ type: [PurchaseOrderItemDto] })
  items?: PurchaseOrderItemDto[];

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  tax: number;

  @ApiPropertyOptional()
  total: number;

  @ApiPropertyOptional()
  currency?: string;

  @ApiPropertyOptional()
  expectedDeliveryDate?: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional()
  storeId?: string;

  constructor(po: any) {
    this.id = po.id;
    this.orderNumber = po.orderNumber;
    this.storeId = po.storeId;
    this.date = po.orderDate
      ? new Date(po.orderDate).toISOString().split('T')[0]
      : '';
    this.vendorId = po.supplierId;
    this.vendorName = po.supplier?.name ?? '';
    this.status = (po.status ?? 'DRAFT').toLowerCase().replace('_', '-');
    this.subtotal = Number(po.subtotal ?? 0);
    this.tax = Number(po.taxAmount ?? 0);
    this.total = Number(po.totalAmount ?? 0);
    this.currency = po.currency ?? 'INR';
    this.expectedDeliveryDate = po.expectedDeliveryDate
      ? new Date(po.expectedDeliveryDate).toISOString().split('T')[0]
      : undefined;
    this.notes = po.notes ?? undefined;
    if (po.items && Array.isArray(po.items)) {
      this.items = po.items.map((line: any) => ({
        itemId: line.productId,
        itemName: line.product?.name ?? line.product?.code ?? '',
        sku: line.product?.code,
        quantity: line.quantity ?? 0,
        unit: (line.product?.attributes as any)?.unit ?? 'pcs',
        rate: Number(line.unitPrice ?? 0),
        amount: Number(line.totalPrice ?? 0),
      }));
    }
  }
}
