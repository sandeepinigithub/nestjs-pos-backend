import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Customer, Prisma } from '@prisma/client';

@Injectable()
export class CustomerRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Customer | null> {
    return this.prisma.customer.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return this.prisma.customer.findUnique({
      where: { email },
    });
  }

  async findByPhone(phone: string): Promise<Customer | null> {
    return this.prisma.customer.findUnique({
      where: { phone },
    });
  }

  async findByCustomerNumber(customerNumber: string): Promise<Customer | null> {
    return this.prisma.customer.findUnique({
      where: { customerNumber },
    });
  }

  async findMany(params: {
    where?: Prisma.CustomerWhereInput;
    orderBy?: Prisma.CustomerOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }): Promise<Customer[]> {
    return this.prisma.customer.findMany(params);
  }

  async create(data: Prisma.CustomerCreateInput): Promise<Customer> {
    return this.prisma.customer.create({
      data,
    });
  }

  async update(id: string, data: Prisma.CustomerUpdateInput): Promise<Customer> {
    return this.prisma.customer.update({
      where: { id },
      data,
    });
  }

  async generateCustomerNumber(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const count = await this.prisma.customer.count({
      where: {
        createdAt: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
      },
    });
    return `CUST-${dateStr}-${String(count + 1).padStart(6, '0')}`;
  }

  async count(where?: Prisma.CustomerWhereInput): Promise<number> {
    return this.prisma.customer.count({ where });
  }
}

