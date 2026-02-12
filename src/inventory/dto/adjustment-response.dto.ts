import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdjustmentItemDto {
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
}

export class AdjustmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  adjustmentNumber: string;

  @ApiProperty()
  date: string;

  @ApiProperty()
  reason: string;

  @ApiPropertyOptional()
  reference?: string;

  @ApiProperty({ enum: ['draft', 'completed', 'adjusted'] })
  status: string;

  @ApiPropertyOptional({ type: [AdjustmentItemDto] })
  items?: AdjustmentItemDto[];

  @ApiPropertyOptional()
  totalValue?: number;

  @ApiPropertyOptional()
  createdBy?: string;

  @ApiPropertyOptional()
  storeId?: string;

  @ApiPropertyOptional()
  storeName?: string;

  constructor(adjustment: any) {
    this.id = adjustment.id;
    this.adjustmentNumber = adjustment.adjustmentNumber;
    this.date = adjustment.adjustmentDate
      ? new Date(adjustment.adjustmentDate).toISOString().split('T')[0]
      : '';
    this.reason = adjustment.reason ?? '';
    this.reference = adjustment.reference ?? undefined;
    this.status =
      adjustment.status === 'COMPLETED' ? 'adjusted' : (adjustment.status?.toLowerCase() ?? 'draft');
    this.totalValue = adjustment.totalValue
      ? Number(adjustment.totalValue)
      : undefined;
    this.createdBy = adjustment.createdBy ?? undefined;
    this.storeId = adjustment.storeId ?? undefined;
    this.storeName = adjustment.store?.name ?? undefined;
    if (adjustment.lines && Array.isArray(adjustment.lines)) {
      this.items = adjustment.lines.map((line: any) => ({
        itemId: line.productId,
        itemName: line.product?.name ?? line.product?.code ?? '',
        sku: line.product?.code,
        quantity: line.quantityDelta ?? 0,
        unit: (line.product?.attributes as any)?.unit ?? 'pcs',
      }));
    }
  }
}
