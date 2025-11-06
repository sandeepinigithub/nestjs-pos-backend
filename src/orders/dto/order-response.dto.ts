import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client';

export class OrderItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  taxAmount: number;

  @ApiProperty()
  discount: number;

  @ApiProperty()
  totalPrice: number;

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional()
  attributes?: any;

  constructor(item: any) {
    this.id = item.id;
    this.productId = item.productId;
    this.quantity = item.quantity;
    this.unitPrice = item.unitPrice;
    this.taxAmount = item.taxAmount;
    this.discount = item.discount;
    this.totalPrice = item.totalPrice;
    this.notes = item.notes;
    this.attributes = item.attributes;
  }
}

export class OrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderNumber: string;

  @ApiProperty()
  storeId: string;

  @ApiPropertyOptional()
  customerId?: string;

  @ApiPropertyOptional()
  customerName?: string;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiPropertyOptional()
  orderType?: string;

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  taxAmount: number;

  @ApiProperty()
  discountAmount: number;

  @ApiProperty()
  totalAmount: number;

  @ApiPropertyOptional()
  loyaltyPointsUsed?: number;

  @ApiPropertyOptional()
  loyaltyPointsEarned?: number;

  @ApiProperty({ enum: PaymentStatus })
  paymentStatus: PaymentStatus;

  @ApiPropertyOptional({ enum: PaymentMethod })
  paymentMethod?: PaymentMethod;

  @ApiProperty()
  orderDate: Date;

  @ApiPropertyOptional()
  completedAt?: Date;

  @ApiProperty({ type: [OrderItemResponseDto] })
  orderItems: OrderItemResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(order: any) {
    this.id = order.id;
    this.orderNumber = order.orderNumber;
    this.storeId = order.storeId;
    this.customerId = order.customerId;
    this.customerName = order.customerName;
    this.status = order.status;
    this.orderType = order.orderType;
    this.subtotal = order.subtotal;
    this.taxAmount = order.taxAmount;
    this.discountAmount = order.discountAmount;
    this.totalAmount = order.totalAmount;
    this.loyaltyPointsUsed = order.loyaltyPointsUsed;
    this.loyaltyPointsEarned = order.loyaltyPointsEarned;
    this.paymentStatus = order.paymentStatus;
    this.paymentMethod = order.paymentMethod;
    this.orderDate = order.orderDate;
    this.completedAt = order.completedAt;
    this.orderItems = order.orderItems?.map((item: any) => new OrderItemResponseDto(item));
    this.createdAt = order.createdAt;
    this.updatedAt = order.updatedAt;
  }
}

