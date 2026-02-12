import { Injectable } from '@nestjs/common';
import { Prisma, Promotion } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PromotionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createPromotion(
    data: Prisma.PromotionCreateInput,
  ): Promise<Promotion> {
    return this.prisma.promotion.create({ data });
  }

  async updatePromotion(
    id: string,
    data: Prisma.PromotionUpdateInput,
  ): Promise<Promotion> {
    return this.prisma.promotion.update({
      where: { id },
      data,
    });
  }

  async deletePromotion(id: string): Promise<void> {
    await this.prisma.promotion.delete({
      where: { id },
    });
  }

  async findById(id: string): Promise<Promotion | null> {
    return this.prisma.promotion.findUnique({
      where: { id },
    });
  }

  async findMany(params: {
    where?: Prisma.PromotionWhereInput;
    orderBy?: Prisma.PromotionOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }): Promise<Promotion[]> {
    return this.prisma.promotion.findMany(params);
  }

  async count(where?: Prisma.PromotionWhereInput): Promise<number> {
    return this.prisma.promotion.count({ where });
  }
}

