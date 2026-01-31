import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsInt,
  IsObject,
  IsDateString,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TenantStatus, SubscriptionPlan } from '@prisma/client';

class AddressDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;
}

class ContactDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  primaryContact?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mobile?: string;
}

class FeaturesDto {
  @ApiPropertyOptional({ default: true })
  @IsOptional()
  inventory?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  sales?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  purchases?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  reports?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  multiStore?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  apiAccess?: boolean;
}

export class CreateTenantDto {
  @ApiProperty({ description: 'Unique tenant code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Tenant/Brand name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Domain/subdomain' })
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiPropertyOptional({ enum: TenantStatus, default: TenantStatus.ACTIVE })
  @IsOptional()
  @IsEnum(TenantStatus)
  status?: TenantStatus;

  @ApiPropertyOptional({ enum: SubscriptionPlan, default: SubscriptionPlan.BASIC })
  @IsOptional()
  @IsEnum(SubscriptionPlan)
  subscriptionPlan?: SubscriptionPlan;

  @ApiPropertyOptional({ description: 'Maximum number of users', default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxUsers?: number;

  @ApiPropertyOptional({ description: 'Maximum number of stores', default: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxStores?: number;

  @ApiPropertyOptional({ type: AddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiPropertyOptional({ type: ContactDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ContactDto)
  contact?: ContactDto;

  @ApiPropertyOptional({ default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ default: 'UTC' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ default: 'en' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ default: 'YYYY-MM-DD' })
  @IsOptional()
  @IsString()
  dateFormat?: string;

  @ApiPropertyOptional({ type: FeaturesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FeaturesDto)
  features?: FeaturesDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  subscriptionStartDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  subscriptionEndDate?: string;
}
