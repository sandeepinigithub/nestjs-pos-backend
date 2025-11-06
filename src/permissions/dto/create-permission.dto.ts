import { IsEnum, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PermissionResource, PermissionAction } from '@prisma/client';

export class CreatePermissionDto {
  @ApiProperty({ enum: PermissionResource, description: 'Resource type' })
  @IsEnum(PermissionResource)
  resource: PermissionResource;

  @ApiProperty({ enum: PermissionAction, description: 'Action type' })
  @IsEnum(PermissionAction)
  action: PermissionAction;

  @ApiProperty({ description: 'Permission name', example: 'Create User' })
  @IsString()
  @MaxLength(200, { message: 'Permission name cannot exceed 200 characters' })
  name: string;

  @ApiPropertyOptional({ description: 'Permission description' })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  description?: string;

  @ApiPropertyOptional({ description: 'Module name', example: 'USER_MANAGEMENT' })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Module name cannot exceed 100 characters' })
  module?: string;

  @ApiPropertyOptional({ description: 'Is permission active', default: true })
  @IsOptional()
  isActive?: boolean;
}

