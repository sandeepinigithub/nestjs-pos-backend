import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  MinLength,
  MaxLength,
  IsEmail,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StoreType, StoreStatus } from '@prisma/client';

export class CreateStoreDto {
  @ApiProperty({ description: 'Store code', example: 'ST001' })
  @IsString()
  @MinLength(2, { message: 'Store code must be at least 2 characters' })
  @MaxLength(50, { message: 'Store code cannot exceed 50 characters' })
  code: string;

  @ApiProperty({ description: 'Store name', example: 'Times Square Store' })
  @IsString()
  @MinLength(2, { message: 'Store name must be at least 2 characters' })
  @MaxLength(200, { message: 'Store name cannot exceed 200 characters' })
  name: string;

  @ApiProperty({ enum: StoreType, description: 'Store type' })
  @IsEnum(StoreType)
  storeType: StoreType;

  @ApiProperty({ enum: StoreStatus, description: 'Store status', default: StoreStatus.ACTIVE })
  @IsEnum(StoreStatus)
  @IsOptional()
  status?: StoreStatus;

  @ApiProperty({ description: 'Country ID' })
  @IsString()
  countryId: string;

  @ApiProperty({ description: 'Region ID' })
  @IsString()
  regionId: string;

  @ApiPropertyOptional({ description: 'Parent store ID for hierarchy' })
  @IsOptional()
  @IsString()
  parentStoreId?: string;

  @ApiProperty({ description: 'Street address' })
  @IsString()
  @MinLength(5, { message: 'Address must be at least 5 characters' })
  address: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  @MinLength(2, { message: 'City must be at least 2 characters' })
  city: string;

  @ApiPropertyOptional({ description: 'State/Province' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: 'Postal code' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({ description: 'Latitude' })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude' })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Timezone', example: 'America/New_York' })
  @IsString()
  timezone: string;

  @ApiProperty({ description: 'Currency code', example: 'USD' })
  @IsString()
  currency: string;

  @ApiPropertyOptional({ description: 'Tax configuration (JSON)' })
  @IsOptional()
  taxConfig?: any;

  @ApiPropertyOptional({ description: 'Payment configuration (JSON)' })
  @IsOptional()
  paymentConfig?: any;

  @ApiPropertyOptional({ description: 'Local server URL' })
  @IsOptional()
  @IsString()
  localServerUrl?: string;

  @ApiProperty({ enum: StoreType, description: 'Ownership type' })
  @IsEnum(StoreType)
  ownershipType: StoreType;

  @ApiPropertyOptional({ description: 'License number (for licensed stores)' })
  @ValidateIf((o) => o.ownershipType === StoreType.LICENSED || o.ownershipType === StoreType.JOINT_VENTURE)
  @IsString()
  licenseNumber?: string;

  @ApiPropertyOptional({ description: 'License expiry date' })
  @ValidateIf((o) => o.ownershipType === StoreType.LICENSED || o.ownershipType === StoreType.JOINT_VENTURE)
  @IsOptional()
  licenseExpiry?: Date;

  @ApiPropertyOptional({ description: 'Store opening date' })
  @IsOptional()
  openedAt?: Date;
}

