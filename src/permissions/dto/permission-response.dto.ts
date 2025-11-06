import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PermissionResource, PermissionAction } from '@prisma/client';

export class PermissionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: PermissionResource })
  resource: PermissionResource;

  @ApiProperty({ enum: PermissionAction })
  action: PermissionAction;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  module?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(permission: any) {
    this.id = permission.id;
    this.resource = permission.resource;
    this.action = permission.action;
    this.name = permission.name;
    this.description = permission.description;
    this.module = permission.module;
    this.isActive = permission.isActive;
    this.createdAt = permission.createdAt;
    this.updatedAt = permission.updatedAt;
  }
}

