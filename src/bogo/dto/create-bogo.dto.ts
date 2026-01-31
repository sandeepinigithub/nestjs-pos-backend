import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsArray,
  IsObject,
  IsDateString,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  BOGOType,
  BOGOStatus,
  OrderChannel,
  CustomerType,
} from '@prisma/client';

export class TriggerConfigDto {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  comboItems?: Array<{ productId: string; quantity: number }>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  groupItems?: string[]; // For Mix & Match
}

export class RewardConfigDto {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productIds?: string[]; // For free items or customer choice

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  flatPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number; // For Case 22: Maximum Price Rule

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  slabs?: Array<{ buyQty: number; getQty: number; reward?: any }>; // For Case 18

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  tiers?: Array<{ minQty: number; reward: any }>; // For Case 21
}

export class TimeRestrictionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startTime?: string; // HH:mm format

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endTime?: string; // HH:mm format

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  days?: string[]; // ["MON", "TUE", "WED", etc.]
}

export class FallbackConfigDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  fallbackProductIds: string[];
}

export class TierConfigDto {
  @ApiProperty({ type: Array })
  @IsArray()
  tiers: Array<{
    minQty: number;
    reward: RewardConfigDto;
  }>;
}

export class CreateBOGODto {
  @ApiProperty({ description: 'Unique offer code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Offer name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Offer description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: BOGOType, description: 'BOGO type (one of 25 cases)' })
  @IsEnum(BOGOType)
  type: BOGOType;

  @ApiPropertyOptional({ enum: BOGOStatus, default: BOGOStatus.ACTIVE })
  @IsOptional()
  @IsEnum(BOGOStatus)
  status?: BOGOStatus;

  @ApiProperty({ type: TriggerConfigDto, description: 'Trigger configuration' })
  @ValidateNested()
  @Type(() => TriggerConfigDto)
  triggerConfig: TriggerConfigDto;

  @ApiProperty({ type: RewardConfigDto, description: 'Reward configuration' })
  @ValidateNested()
  @Type(() => RewardConfigDto)
  rewardConfig: RewardConfigDto;

  @ApiPropertyOptional({ description: 'Minimum bill amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minBillAmount?: number;

  @ApiPropertyOptional({ description: 'Maximum free items per order' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxFreeItems?: number;

  @ApiPropertyOptional({ description: 'Maximum usage per order' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUsagePerOrder?: number;

  @ApiPropertyOptional({ description: 'Maximum usage per customer' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUsagePerCustomer?: number;

  @ApiPropertyOptional({ description: 'Maximum total usage' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUsageTotal?: number;

  @ApiPropertyOptional({ description: 'Valid from date' })
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional({ description: 'Valid to date' })
  @IsOptional()
  @IsDateString()
  validTo?: string;

  @ApiPropertyOptional({ type: TimeRestrictionsDto, description: 'Time restrictions' })
  @IsOptional()
  @ValidateNested()
  @Type(() => TimeRestrictionsDto)
  timeRestrictions?: TimeRestrictionsDto;

  @ApiPropertyOptional({ enum: OrderChannel, isArray: true, description: 'Order channels' })
  @IsOptional()
  @IsArray()
  @IsEnum(OrderChannel, { each: true })
  orderChannels?: OrderChannel[];

  @ApiPropertyOptional({ enum: CustomerType, isArray: true, description: 'Customer types' })
  @IsOptional()
  @IsArray()
  @IsEnum(CustomerType, { each: true })
  customerTypes?: CustomerType[];

  @ApiPropertyOptional({ type: [String], description: 'Store IDs (for location-specific)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  storeIds?: string[];

  @ApiPropertyOptional({ description: 'Tenant ID' })
  @IsOptional()
  @IsString()
  tenantId?: string;

  @ApiPropertyOptional({ type: FallbackConfigDto, description: 'Fallback configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => FallbackConfigDto)
  fallbackConfig?: FallbackConfigDto;

  @ApiPropertyOptional({ type: TierConfigDto, description: 'Tier configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => TierConfigDto)
  tierConfig?: TierConfigDto;

  @ApiPropertyOptional({ default: false, description: 'Is repeatable' })
  @IsOptional()
  @IsBoolean()
  repeatable?: boolean;

  @ApiPropertyOptional({ description: 'Repeat cycle' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  repeatCycle?: number;

  @ApiPropertyOptional({ description: 'Coupon code' })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({ default: false, description: 'Requires coupon code' })
  @IsOptional()
  @IsBoolean()
  requiresCoupon?: boolean;

  @ApiPropertyOptional({ default: false, description: 'Allow manual application' })
  @IsOptional()
  @IsBoolean()
  allowManual?: boolean;

  @ApiPropertyOptional({ default: 0, description: 'Priority (higher = applied first)' })
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
