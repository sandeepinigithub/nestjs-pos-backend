import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  BOGOOffer,
  BOGOApplication,
  BOGOVoucher,
  Prisma,
  BOGOStatus,
  BOGOType,
} from '@prisma/client';

@Injectable()
export class BOGORepository {
  constructor(private prisma: PrismaService) {}

  // BOGO Offers
  async findBOGOById(id: string): Promise<BOGOOffer | null> {
    return this.prisma.bOGOOffer.findUnique({
      where: { id },
      include: {
        tenant: true,
        applications: {
          take: 10,
          orderBy: { appliedAt: 'desc' },
        },
      },
    });
  }

  async findBOGOByCode(code: string): Promise<BOGOOffer | null> {
    return this.prisma.bOGOOffer.findUnique({
      where: { code },
    });
  }

  async findBOGOByCouponCode(couponCode: string): Promise<BOGOOffer | null> {
    return this.prisma.bOGOOffer.findUnique({
      where: { couponCode },
    });
  }

  async findBOGOs(params: {
    where?: Prisma.BOGOOfferWhereInput;
    include?: Prisma.BOGOOfferInclude;
    orderBy?: Prisma.BOGOOfferOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }): Promise<BOGOOffer[]> {
    return this.prisma.bOGOOffer.findMany(params);
  }

  async createBOGO(data: Prisma.BOGOOfferCreateInput): Promise<BOGOOffer> {
    return this.prisma.bOGOOffer.create({
      data,
      include: {
        tenant: true,
      },
    });
  }

  async updateBOGO(
    id: string,
    data: Prisma.BOGOOfferUpdateInput,
  ): Promise<BOGOOffer> {
    return this.prisma.bOGOOffer.update({
      where: { id },
      data,
      include: {
        tenant: true,
      },
    });
  }

  async deleteBOGO(id: string): Promise<void> {
    await this.prisma.bOGOOffer.delete({
      where: { id },
    });
  }

  async countBOGOs(where?: Prisma.BOGOOfferWhereInput): Promise<number> {
    return this.prisma.bOGOOffer.count({ where });
  }

  async incrementUsage(id: string): Promise<void> {
    await this.prisma.bOGOOffer.update({
      where: { id },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    });
  }

  // BOGO Applications
  async createApplication(
    data: Prisma.BOGOApplicationCreateInput,
  ): Promise<BOGOApplication> {
    return this.prisma.bOGOApplication.create({
      data,
      include: {
        bogoOffer: true,
        order: true,
      },
    });
  }

  async findApplicationsByOrder(orderId: string): Promise<BOGOApplication[]> {
    return this.prisma.bOGOApplication.findMany({
      where: { orderId },
      include: {
        bogoOffer: true,
      },
    });
  }

  async findApplicationsByBOGO(bogoOfferId: string): Promise<BOGOApplication[]> {
    return this.prisma.bOGOApplication.findMany({
      where: { bogoOfferId },
      include: {
        order: true,
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  // BOGO Vouchers
  async createVoucher(data: Prisma.BOGOVoucherCreateInput): Promise<BOGOVoucher> {
    return this.prisma.bOGOVoucher.create({
      data,
      include: {
        bogoOffer: true,
        order: true,
        customer: true,
      },
    });
  }

  async findVoucherByCode(voucherCode: string): Promise<BOGOVoucher | null> {
    return this.prisma.bOGOVoucher.findUnique({
      where: { voucherCode },
      include: {
        bogoOffer: true,
        order: true,
        customer: true,
      },
    });
  }

  async findVouchersByCustomer(customerId: string): Promise<BOGOVoucher[]> {
    return this.prisma.bOGOVoucher.findMany({
      where: {
        customerId,
        status: 'PENDING',
        OR: [
          { validTo: null },
          { validTo: { gte: new Date() } },
        ],
      },
      include: {
        bogoOffer: true,
      },
      orderBy: { validTo: 'asc' },
    });
  }

  async redeemVoucher(
    voucherCode: string,
    orderId: string,
    userId: string,
  ): Promise<BOGOVoucher> {
    return this.prisma.bOGOVoucher.update({
      where: { voucherCode },
      data: {
        status: 'REDEEMED',
        redeemedAt: new Date(),
        redeemedOrderId: orderId,
        redeemedBy: userId,
      },
      include: {
        bogoOffer: true,
        redeemedOrder: true,
      },
    });
  }

  async generateVoucherCode(): Promise<string> {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `BOGO-${timestamp}-${random}`;
  }
}
