import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAdjustmentLineDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Positive = IN, negative = OUT' })
  @IsInt()
  @Type(() => Number)
  quantityDelta: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  unitCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateAdjustmentDto {
  @ApiProperty()
  @IsString()
  storeId: string;

  @ApiProperty({ description: 'ISO date string' })
  @IsDateString()
  adjustmentDate: string;

  @ApiProperty()
  @IsString()
  reason: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({ enum: ['draft', 'completed'], default: 'draft' })
  @IsOptional()
  @IsString()
  status?: 'draft' | 'completed';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [CreateAdjustmentLineDto], minItems: 1 })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAdjustmentLineDto)
  lines: CreateAdjustmentLineDto[];
}
