import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus, PaymentMethod } from '@prisma/client';

export class CreateOrderItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Quantity', example: 2 })
  @IsNumber()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;

  @ApiPropertyOptional({ description: 'Unit price override' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @ApiPropertyOptional({ description: 'Item notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Custom attributes (JSON)' })
  @IsOptional()
  attributes?: any;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Store ID' })
  @IsString()
  storeId: string;

  @ApiPropertyOptional({ description: 'Customer ID (for registered customers)' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Customer name (for guest orders)' })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({ description: 'Customer phone' })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiPropertyOptional({ description: 'Customer email' })
  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @ApiProperty({ enum: OrderStatus, default: OrderStatus.PENDING })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiPropertyOptional({ description: 'Order type', example: 'DINE_IN' })
  @IsOptional()
  @IsString()
  orderType?: string;

  @ApiProperty({ description: 'Order items', type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiPropertyOptional({ description: 'Discount amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({ description: 'Order notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: PaymentMethod, description: 'Payment method' })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}

