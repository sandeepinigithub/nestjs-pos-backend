import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InventoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  storeId: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  reservedQuantity: number;

  @ApiProperty()
  availableQuantity: number;

  @ApiPropertyOptional()
  reorderLevel?: number;

  @ApiPropertyOptional()
  maxLevel?: number;

  @ApiPropertyOptional()
  location?: string;

  @ApiProperty()
  lastUpdated: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(inventory: any) {
    this.id = inventory.id;
    this.productId = inventory.productId;
    this.storeId = inventory.storeId;
    this.quantity = inventory.quantity;
    this.reservedQuantity = inventory.reservedQuantity;
    this.availableQuantity = inventory.availableQuantity;
    this.reorderLevel = inventory.reorderLevel;
    this.maxLevel = inventory.maxLevel;
    this.location = inventory.location;
    this.lastUpdated = inventory.lastUpdated;
    this.createdAt = inventory.createdAt;
    this.updatedAt = inventory.updatedAt;
  }
}

