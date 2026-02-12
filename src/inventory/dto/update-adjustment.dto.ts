import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAdjustmentLineDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({ description: 'Positive = IN, negative = OUT' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  quantityDelta?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  unitCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateAdjustmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  adjustmentDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({ enum: ['draft', 'completed'] })
  @IsOptional()
  @IsString()
  status?: 'draft' | 'completed';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [UpdateAdjustmentLineDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAdjustmentLineDto)
  lines?: UpdateAdjustmentLineDto[];
}
