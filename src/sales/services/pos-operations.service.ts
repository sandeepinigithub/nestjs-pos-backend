import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import {
  HoldOrderDto,
  ResumeOrderDto,
  CancelOrderDto,
  ProcessPaymentDto,
  VoidPaymentDto,
  CreateKOTDto,
  TrackTastingDto,
} from '../dto/pos-operations.dto';
import { OrderResponseDto } from '../../orders/dto/order-response.dto';
import { OrderStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class PosOperationsService {
  constructor(private prisma: PrismaService) {}

  async holdOrder(
    orderId: string,
    holdOrderDto: HoldOrderDto,
    currentUser: UserResponseDto,
  ): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        store: true,
        customer: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.isHeld) {
      throw new BadRequestException('Order is already held');
    }

    if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot hold a completed or cancelled order');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        isHeld: true,
        heldAt: new Date(),
        heldBy: currentUser.id,
        heldReason: holdOrderDto.reason,
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        store: true,
        customer: true,
      },
    });

    return new OrderResponseDto(updatedOrder);
  }

  async resumeOrder(
    orderId: string,
    resumeOrderDto: ResumeOrderDto,
    currentUser: UserResponseDto,
  ): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        store: true,
        customer: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (!order.isHeld) {
      throw new BadRequestException('Order is not held');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        isHeld: false,
        resumedAt: new Date(),
        resumedBy: currentUser.id,
        notes: order.notes
          ? `${order.notes}\nResumed: ${resumeOrderDto.notes || 'No notes'}`
          : `Resumed: ${resumeOrderDto.notes || 'No notes'}`,
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        store: true,
        customer: true,
      },
    });

    return new OrderResponseDto(updatedOrder);
  }

  async cancelOrder(
    orderId: string,
    cancelOrderDto: CancelOrderDto,
    currentUser: UserResponseDto,
  ): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        store: true,
        customer: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed order');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelledBy: currentUser.id,
        cancelledReason: cancelOrderDto.reason,
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        store: true,
        customer: true,
      },
    });

    return new OrderResponseDto(updatedOrder);
  }

  async processPayment(
    orderId: string,
    processPaymentDto: ProcessPaymentDto,
    currentUser: UserResponseDto,
  ): Promise<any> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const totalPaid = order.payments
      .filter((p) => p.status === PaymentStatus.COMPLETED)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const remainingAmount = Number(order.totalAmount) - totalPaid;

    if (processPaymentDto.amount > remainingAmount) {
      throw new BadRequestException(
        `Payment amount exceeds remaining balance. Remaining: ${remainingAmount}`,
      );
    }

    const payment = await this.prisma.payment.create({
      data: {
        order: { connect: { id: orderId } },
        paymentMethod: processPaymentDto.paymentMethod,
        amount: processPaymentDto.amount,
        status: PaymentStatus.COMPLETED,
        transactionId: processPaymentDto.transactionId,
        referenceNumber: processPaymentDto.referenceNumber,
        receiptUrl: processPaymentDto.receiptUrl,
        processedAt: new Date(),
      },
    });

    // Update order payment status
    const newTotalPaid = totalPaid + Number(processPaymentDto.amount);
    const isFullyPaid = newTotalPaid >= Number(order.totalAmount);

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: isFullyPaid ? PaymentStatus.COMPLETED : PaymentStatus.PARTIALLY_REFUNDED,
      },
    });

    return payment;
  }

  async voidPayment(
    orderId: string,
    voidPaymentDto: VoidPaymentDto,
    currentUser: UserResponseDto,
  ): Promise<any> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: voidPaymentDto.paymentId },
      include: {
        order: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.orderId !== orderId) {
      throw new BadRequestException('Payment does not belong to this order');
    }

    if (payment.status === PaymentStatus.REFUNDED) {
      throw new BadRequestException('Payment is already voided/refunded');
    }

    const voidedPayment = await this.prisma.payment.update({
      where: { id: voidPaymentDto.paymentId },
      data: {
        status: PaymentStatus.REFUNDED,
        refundAmount: payment.amount,
        refundReason: voidPaymentDto.reason,
        refundedAt: new Date(),
      },
    });

    // Update order payment status
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payments: true,
      },
    });

    if (order) {
      const totalPaid = order.payments
        .filter((p) => p.status === PaymentStatus.COMPLETED)
        .reduce((sum, p) => sum + Number(p.amount), 0);

      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus:
            totalPaid >= Number(order.totalAmount)
              ? PaymentStatus.COMPLETED
              : totalPaid > 0
                ? PaymentStatus.PARTIALLY_REFUNDED
                : PaymentStatus.PENDING,
        },
      });
    }

    return voidedPayment;
  }

  async createKOT(
    orderId: string,
    createKOTDto: CreateKOTDto,
    currentUser: UserResponseDto,
  ): Promise<any> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        store: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Generate KOT number
    const kotNumber = await this.generateKOTNumber(order.storeId);

    // Filter order items for KOT
    const kotItems = order.orderItems.filter((item) =>
      createKOTDto.orderItemIds.includes(item.id),
    );

    if (kotItems.length === 0) {
      throw new BadRequestException('No valid order items selected for KOT');
    }

    // Prepare items data for KOT
    const itemsData = kotItems.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity,
      notes: item.notes,
    }));

    const kot = await this.prisma.kOT.create({
      data: {
        kotNumber,
        orderId,
        storeId: order.storeId,
        status: 'SENT',
        items: itemsData as any,
        tableNumber: createKOTDto.tableNumber,
        notes: createKOTDto.notes,
        createdBy: currentUser.id,
      },
      include: {
        order: true,
        store: true,
      },
    });

    return kot;
  }

  async trackTasting(
    orderId: string,
    trackTastingDto: TrackTastingDto,
    currentUser: UserResponseDto,
  ): Promise<any> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const product = await this.prisma.product.findUnique({
      where: { id: trackTastingDto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const tasting = await this.prisma.tasting.create({
      data: {
        orderId,
        productId: trackTastingDto.productId,
        quantity: trackTastingDto.quantity,
        tastingType: trackTastingDto.tastingType || 'SAMPLE',
        customerFeedback: trackTastingDto.customerFeedback,
        notes: trackTastingDto.notes,
        createdBy: currentUser.id,
      },
      include: {
        product: true,
        order: true,
      },
    });

    return tasting;
  }

  private async generateKOTNumber(storeId: string): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const datePrefix = `${year}${month}`;

    // Find the last KOT for this store today
    const lastKOT = await this.prisma.kOT.findFirst({
      where: {
        storeId,
        kotNumber: {
          startsWith: `KOT-${datePrefix}`,
        },
      },
      orderBy: {
        kotNumber: 'desc',
      },
    });

    let sequence = 1;
    if (lastKOT) {
      const lastSequence = parseInt(lastKOT.kotNumber.split('-').pop() || '0');
      sequence = lastSequence + 1;
    }

    return `KOT-${datePrefix}-${String(sequence).padStart(6, '0')}`;
  }
}
