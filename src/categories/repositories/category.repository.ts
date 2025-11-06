import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Category, Prisma } from '@prisma/client';

@Injectable()
export class CategoryRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async findByCode(code: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { code },
    });
  }

  async findMany(params: {
    where?: Prisma.CategoryWhereInput;
    include?: Prisma.CategoryInclude;
    orderBy?: Prisma.CategoryOrderByWithRelationInput;
  }): Promise<Category[]> {
    return this.prisma.category.findMany(params);
  }

  async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return this.prisma.category.create({
      data,
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category> {
    return this.prisma.category.update({
      where: { id },
      data,
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({
      where: { id },
    });
  }

  async findRootCategories(): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: { parentId: null },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async count(where?: Prisma.CategoryWhereInput): Promise<number> {
    return this.prisma.category.count({ where });
  }
}

