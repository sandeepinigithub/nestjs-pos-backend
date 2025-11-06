import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '@prisma/client';

export class ProductResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  categoryId: string;

  @ApiPropertyOptional()
  image?: string;

  @ApiProperty({ enum: ProductStatus })
  status: ProductStatus;

  @ApiProperty()
  isAvailable: boolean;

  @ApiProperty()
  basePrice: number;

  @ApiPropertyOptional()
  costPrice?: number;

  @ApiPropertyOptional()
  attributes?: any;

  @ApiPropertyOptional({ type: [String] })
  tags?: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(product: any) {
    this.id = product.id;
    this.code = product.code;
    this.name = product.name;
    this.description = product.description;
    this.categoryId = product.categoryId;
    this.image = product.image;
    this.status = product.status;
    this.isAvailable = product.isAvailable;
    this.basePrice = product.basePrice;
    this.costPrice = product.costPrice;
    this.attributes = product.attributes;
    this.tags = product.tags;
    this.createdAt = product.createdAt;
    this.updatedAt = product.updatedAt;
  }
}

