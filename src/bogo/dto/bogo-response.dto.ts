import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BOGOOffer, BOGOType, BOGOStatus, OrderChannel, CustomerType } from '@prisma/client';

export class BOGOOfferResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ enum: BOGOType })
  type: BOGOType;

  @ApiProperty({ enum: BOGOStatus })
  status: BOGOStatus;

  @ApiProperty()
  triggerConfig: any;

  @ApiProperty()
  rewardConfig: any;

  @ApiPropertyOptional()
  minBillAmount?: number;

  @ApiPropertyOptional()
  maxFreeItems?: number;

  @ApiPropertyOptional()
  maxUsagePerOrder?: number;

  @ApiPropertyOptional()
  maxUsagePerCustomer?: number;

  @ApiPropertyOptional()
  maxUsageTotal?: number;

  @ApiPropertyOptional()
  validFrom?: Date;

  @ApiPropertyOptional()
  validTo?: Date;

  @ApiPropertyOptional()
  timeRestrictions?: any;

  @ApiPropertyOptional({ enum: OrderChannel, isArray: true })
  orderChannels?: OrderChannel[];

  @ApiPropertyOptional({ enum: CustomerType, isArray: true })
  customerTypes?: CustomerType[];

  @ApiPropertyOptional({ type: [String] })
  storeIds?: string[];

  @ApiPropertyOptional()
  tenantId?: string;

  @ApiPropertyOptional()
  fallbackConfig?: any;

  @ApiPropertyOptional()
  tierConfig?: any;

  @ApiProperty()
  repeatable: boolean;

  @ApiPropertyOptional()
  repeatCycle?: number;

  @ApiPropertyOptional()
  couponCode?: string;

  @ApiProperty()
  requiresCoupon: boolean;

  @ApiProperty()
  allowManual: boolean;

  @ApiProperty()
  priority: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  usageCount: number;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(bogoOffer: BOGOOffer) {
    this.id = bogoOffer.id;
    this.code = bogoOffer.code;
    this.name = bogoOffer.name;
    this.description = bogoOffer.description || undefined;
    this.type = bogoOffer.type;
    this.status = bogoOffer.status;
    this.triggerConfig = bogoOffer.triggerConfig;
    this.rewardConfig = bogoOffer.rewardConfig;
    this.minBillAmount = bogoOffer.minBillAmount ? Number(bogoOffer.minBillAmount) : undefined;
    this.maxFreeItems = bogoOffer.maxFreeItems || undefined;
    this.maxUsagePerOrder = bogoOffer.maxUsagePerOrder || undefined;
    this.maxUsagePerCustomer = bogoOffer.maxUsagePerCustomer || undefined;
    this.maxUsageTotal = bogoOffer.maxUsageTotal || undefined;
    this.validFrom = bogoOffer.validFrom || undefined;
    this.validTo = bogoOffer.validTo || undefined;
    this.timeRestrictions = bogoOffer.timeRestrictions || undefined;
    this.orderChannels = bogoOffer.orderChannels || undefined;
    this.customerTypes = bogoOffer.customerTypes || undefined;
    this.storeIds = bogoOffer.storeIds || undefined;
    this.tenantId = bogoOffer.tenantId || undefined;
    this.fallbackConfig = bogoOffer.fallbackConfig || undefined;
    this.tierConfig = bogoOffer.tierConfig || undefined;
    this.repeatable = bogoOffer.repeatable;
    this.repeatCycle = bogoOffer.repeatCycle || undefined;
    this.couponCode = bogoOffer.couponCode || undefined;
    this.requiresCoupon = bogoOffer.requiresCoupon;
    this.allowManual = bogoOffer.allowManual;
    this.priority = bogoOffer.priority;
    this.isActive = bogoOffer.isActive;
    this.usageCount = bogoOffer.usageCount;
    this.notes = bogoOffer.notes || undefined;
    this.createdAt = bogoOffer.createdAt;
    this.updatedAt = bogoOffer.updatedAt;
  }
}
