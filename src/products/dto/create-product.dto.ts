import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  MinLength,
  MaxLength,
  IsArray,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '@prisma/client';

export class CreateProductDto {
  @ApiProperty({ description: 'Product code/SKU', example: 'PROD-001' })
  @IsString()
  @MinLength(2, { message: 'Product code must be at least 2 characters' })
  @MaxLength(50, { message: 'Product code cannot exceed 50 characters' })
  code: string;

  @ApiProperty({ description: 'Product name', example: 'Cappuccino' })
  @IsString()
  @MinLength(2, { message: 'Product name must be at least 2 characters' })
  @MaxLength(200, { message: 'Product name cannot exceed 200 characters' })
  name: string;

  @ApiPropertyOptional({ description: 'Product description' })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
  description?: string;

  @ApiProperty({ description: 'Category ID' })
  @IsString()
  categoryId: string;

  @ApiPropertyOptional({ description: 'Product image URL' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ enum: ProductStatus, default: ProductStatus.ACTIVE })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @ApiProperty({ description: 'Base price', example: 5.99 })
  @IsNumber()
  @Min(0, { message: 'Base price must be positive' })
  basePrice: number;

  @ApiPropertyOptional({ description: 'Cost price', example: 2.50 })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Cost price must be positive' })
  costPrice?: number;

  @ApiPropertyOptional({ description: 'Product attributes (JSON)', example: { size: 'Large', flavor: 'Vanilla' } })
  @IsOptional()
  attributes?: any;

  @ApiPropertyOptional({ description: 'Product tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Is product available', default: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

