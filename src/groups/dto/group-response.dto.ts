import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GroupResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  parentId?: string;

  @ApiProperty()
  level: number;

  @ApiProperty()
  isActive: boolean;

  @ApiPropertyOptional()
  parent?: GroupResponseDto;

  @ApiPropertyOptional({ type: [GroupResponseDto] })
  children?: GroupResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(group: any) {
    this.id = group.id;
    this.name = group.name;
    this.code = group.code;
    this.description = group.description;
    this.parentId = group.parentId;
    this.level = group.level;
    this.isActive = group.isActive;
    this.parent = group.parent ? new GroupResponseDto(group.parent) : undefined;
    this.children = group.children?.map((c: any) => new GroupResponseDto(c));
    this.createdAt = group.createdAt;
    this.updatedAt = group.updatedAt;
  }
}

