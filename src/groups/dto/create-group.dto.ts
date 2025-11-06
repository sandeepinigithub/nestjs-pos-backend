import { IsString, IsOptional, MinLength, MaxLength, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({ description: 'Group name', example: 'Store Managers' })
  @IsString()
  @MinLength(2, { message: 'Group name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Group name cannot exceed 100 characters' })
  name: string;

  @ApiProperty({ description: 'Unique group code', example: 'STORE_MANAGERS' })
  @IsString()
  @MinLength(2, { message: 'Group code must be at least 2 characters long' })
  @MaxLength(50, { message: 'Group code cannot exceed 50 characters' })
  code: string;

  @ApiPropertyOptional({ description: 'Group description' })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  description?: string;

  @ApiPropertyOptional({ description: 'Parent group ID for hierarchy' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ description: 'Is group active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

