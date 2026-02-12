import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePromotionDto {
  @ApiProperty({ description: 'Promotion name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Promotion description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Type of promotion',
    enum: ['basic', 'advanced'],
  })
  @IsString()
  promotionType: 'basic' | 'advanced';

  @ApiPropertyOptional({
    description: 'Status of promotion',
    enum: ['active', 'inactive', 'draft'],
    default: 'active',
  })
  @IsOptional()
  @IsString()
  status?: 'active' | 'inactive' | 'draft';

  @ApiProperty({
    description: 'Outlet IDs where promotion is available',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  outletIds: string[];

  @ApiPropertyOptional({
    description: 'Order channels where promotion applies',
    type: [String],
    example: ['dine_in', 'takeaway', 'delivery'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  orderChannels?: string[];

  @ApiPropertyOptional({
    description: 'Application method (auto or manual)',
    example: 'auto',
  })
  @IsOptional()
  @IsString()
  applicationMethod?: string;

  @ApiProperty({
    description: 'Schedule configuration as sent by UI',
  })
  @IsObject()
  schedule: any;

  @ApiPropertyOptional({
    description: 'Basic discount configuration (for basic promotions)',
  })
  @IsOptional()
  @IsObject()
  discount?: any;

  @ApiPropertyOptional({
    description: 'Trigger condition (for advanced promotions)',
  })
  @IsOptional()
  @IsObject()
  triggerCondition?: any;

  @ApiPropertyOptional({
    description: 'Reward action (for advanced promotions)',
  })
  @IsOptional()
  @IsObject()
  rewardAction?: any;

  @ApiPropertyOptional({
    description: 'Target audience mode',
    example: 'everyone',
  })
  @IsOptional()
  @IsString()
  targetAudience?: string;

  @ApiPropertyOptional({
    description: 'Customer groups if targetAudience is exclusive',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  customerGroups?: string[];

  @ApiPropertyOptional({
    description: 'Promo code, if any',
  })
  @IsOptional()
  @IsString()
  promoCode?: string;

  @ApiPropertyOptional({
    description: 'Whether to show prompt on Sell screen',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  showPromptOnSell?: boolean;

  @ApiPropertyOptional({
    description: 'Whether loyalty can be earned with this promotion',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  offerLoyalty?: boolean;
}

