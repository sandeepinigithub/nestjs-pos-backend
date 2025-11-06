import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Product, Prisma, ProductStatus } from '@prisma/client';

@Injectable()
export class ProductRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  async findByCode(code: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { code },
    });
  }

  async findMany(params: {
    where?: Prisma.ProductWhereInput;
    include?: Prisma.ProductInclude;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }): Promise<Product[]> {
    return this.prisma.product.findMany(params);
  }

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return this.prisma.product.create({
      data,
      include: {
        category: true,
      },
    });
  }

  async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({
      where: { id },
    });
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: { categoryId },
    });
  }

  async count(where?: Prisma.ProductWhereInput): Promise<number> {
    return this.prisma.product.count({ where });
  }
}

