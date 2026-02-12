import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  parentId?: string;

  @ApiPropertyOptional()
  image?: string;

  @ApiProperty()
  displayOrder: number;

  @ApiProperty()
  isActive: boolean;

  @ApiPropertyOptional()
  parent?: CategoryResponseDto;

  @ApiPropertyOptional({ type: [CategoryResponseDto] })
  children?: CategoryResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(category: any) {
    this.id = category.id;
    this.code = category.code;
    this.name = category.name;
    this.description = category.description;
    this.parentId = category.parentId;
    this.image = category.image;
    this.displayOrder = category.displayOrder;
    this.isActive = category.isActive;
    // Avoid circular reference: parent/children from Prisma include the full graph and cause stack overflow
    this.parent = category.parent
      ? new CategoryResponseDto({ ...category.parent, parent: undefined, children: undefined })
      : undefined;
    this.children = category.children?.map((c: any) =>
      new CategoryResponseDto({ ...c, parent: undefined, children: undefined })
    );
    this.createdAt = category.createdAt;
    this.updatedAt = category.updatedAt;
  }
}

