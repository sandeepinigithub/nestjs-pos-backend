import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { OrderRepository } from '../repositories/order.repository';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderResponseDto } from '../dto/order-response.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { PaginationDto, PaginationResponseDto } from '../../common/dto/pagination.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private orderRepository: OrderRepository,
    private prisma: PrismaService,
  ) {}

  async create(createOrderDto: CreateOrderDto, currentUser?: UserResponseDto): Promise<OrderResponseDto> {
    // Validate store exists
    const store = await this.prisma.store.findUnique({
      where: { id: createOrderDto.storeId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Generate order number
    const orderNumber = await this.orderRepository.generateOrderNumber(createOrderDto.storeId);

    // Calculate totals
    let subtotal = 0;
    const orderItems: any[] = [];

    for (const item of createOrderDto.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
        include: {
          productStores: {
            where: { storeId: createOrderDto.storeId },
          },
        },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${item.productId} not found`);
      }

      const unitPrice = item.unitPrice 
        ? Number(item.unitPrice) 
        : product.productStores[0]?.price 
        ? Number(product.productStores[0].price) 
        : Number(product.basePrice || 0);
      const itemSubtotal = Number(unitPrice) * Number(item.quantity);
      subtotal += itemSubtotal;

      orderItems.push({
        product: { connect: { id: item.productId } },
        quantity: item.quantity,
        unitPrice: Number(unitPrice),
        taxAmount: 0, // Calculate tax later
        discount: 0,
        totalPrice: Number(itemSubtotal),
        notes: item.notes,
        attributes: item.attributes,
      });
    }

    const discountAmount = createOrderDto.discountAmount || 0;
    const taxAmount = 0; // TODO: Calculate tax based on store configuration
    const totalAmount = subtotal + taxAmount - discountAmount;

    // Create order
    const order = await this.orderRepository.create({
      orderNumber,
      store: { connect: { id: createOrderDto.storeId } },
      customer: createOrderDto.customerId
        ? { connect: { id: createOrderDto.customerId } }
        : undefined,
      customerName: createOrderDto.customerName,
      customerPhone: createOrderDto.customerPhone,
      customerEmail: createOrderDto.customerEmail,
      status: createOrderDto.status || OrderStatus.PENDING,
      orderType: createOrderDto.orderType,
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      paymentStatus: 'PENDING',
      paymentMethod: createOrderDto.paymentMethod,
      notes: createOrderDto.notes,
      orderItems: {
        create: orderItems,
      },
      ...(currentUser?.id ? { createdBy: currentUser.id } : {}),
    });

    return new OrderResponseDto(order);
  }

  async findAll(
    paginationDto: PaginationDto,
    filters?: { storeId?: string; status?: string; customerId?: string },
  ): Promise<PaginationResponseDto<OrderResponseDto>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.storeId) where.storeId = filters.storeId;
    if (filters?.status) where.status = filters.status;
    if (filters?.customerId) where.customerId = filters.customerId;

    const [orders, total] = await Promise.all([
      this.orderRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { orderDate: 'desc' },
        include: {
          store: true,
          customer: true,
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      }),
      this.orderRepository.count(where),
    ]);

    return {
      data: orders.map((order) => new OrderResponseDto(order)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return new OrderResponseDto(order);
  }

  async findByStore(storeId: string, paginationDto: PaginationDto): Promise<PaginationResponseDto<OrderResponseDto>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.orderRepository.findByStore(storeId, { skip, take: limit }),
      this.orderRepository.count({ storeId }),
    ]);

    return {
      data: orders.map((order) => new OrderResponseDto(order)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

