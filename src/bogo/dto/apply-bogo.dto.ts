import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class ApplyBOGODto {
  @ApiPropertyOptional({ description: 'BOGO offer ID (if manual application)' })
  @IsOptional()
  @IsString()
  bogoOfferId?: string;

  @ApiPropertyOptional({ description: 'Coupon code (for coupon-based offers)' })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({
    description: 'Selected product IDs (for customer choice offers)',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedProductIds?: string[];

  @ApiPropertyOptional({ description: 'Is manual application' })
  @IsOptional()
  @IsBoolean()
  isManual?: boolean;
}

export class EligibleBOGOResponseDto {
  @ApiProperty()
  bogoOfferId: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  discountAmount: number;

  @ApiProperty()
  freeItems: Array<{
    productId: string;
    productName: string;
    quantity: number;
  }>;

  @ApiProperty()
  requiresSelection: boolean; // For customer choice offers

  @ApiPropertyOptional({ type: [String] })
  selectableProducts?: Array<{
    productId: string;
    productName: string;
    maxPrice?: number;
  }>;
}
