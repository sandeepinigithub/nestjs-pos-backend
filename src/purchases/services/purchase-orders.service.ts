import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PurchaseOrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PurchaseRepository } from '../repositories/purchase.repository';
import { CreatePurchaseOrderDto } from '../dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from '../dto/update-purchase-order.dto';
import { PurchaseOrderResponseDto } from '../dto/purchase-order-response.dto';
import { ListPurchaseOrdersQueryDto } from '../dto/list-purchase-orders-query.dto';
import { PaginationResponseDto } from '../../common/dto/pagination.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';

@Injectable()
export class PurchaseOrdersService {
  constructor(private readonly purchaseRepository: PurchaseRepository) {}

  async findAll(
    query: ListPurchaseOrdersQueryDto,
    _currentUser?: UserResponseDto,
  ): Promise<PaginationResponseDto<PurchaseOrderResponseDto>> {
    const { page = 1, limit = 10, storeId, vendorId, status, from, to } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (storeId) where.storeId = storeId;
    if (vendorId) where.supplierId = vendorId;
    if (status && status !== 'all') {
      const statusUpper = status.toUpperCase().replace(/-/g, '_');
      if (Object.values(PurchaseOrderStatus).includes(statusUpper as PurchaseOrderStatus)) {
        where.status = statusUpper;
      }
    }
    if (from || to) {
      where.orderDate = {};
      if (from) where.orderDate.gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        where.orderDate.lte = toDate;
      }
    }

    const [orders, total] = await Promise.all([
      this.purchaseRepository.findPurchaseOrders({
        where,
        include: {
          supplier: true,
          store: true,
          items: { include: { product: true } },
        },
        orderBy: { orderDate: 'desc' },
        skip,
        take: limit,
      }) as Promise<any[]>,
      this.purchaseRepository.countPurchaseOrders(where),
    ]);

    return {
      data: orders.map((o) => new PurchaseOrderResponseDto(o)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<PurchaseOrderResponseDto> {
    const po = await this.purchaseRepository.findPurchaseOrderById(id);
    if (!po) {
      throw new NotFoundException('Purchase order not found');
    }
    return new PurchaseOrderResponseDto(po as any);
  }

  async create(
    dto: CreatePurchaseOrderDto,
    currentUser?: UserResponseDto,
  ): Promise<PurchaseOrderResponseDto> {
    if (!dto.lines?.length) {
      throw new BadRequestException('At least one line item is required');
    }

    const orderNumber = await this.purchaseRepository.getNextPurchaseOrderNumber();
    const orderDate = dto.orderDate ? new Date(dto.orderDate) : new Date();
    const expectedDeliveryDate = dto.expectedDeliveryDate
      ? new Date(dto.expectedDeliveryDate)
      : undefined;

    let subtotal = 0;
    const itemsCreate = dto.lines.map((l) => {
      const qty = l.quantity;
      const unitPrice = l.unitPrice;
      const taxRate = l.taxRate ?? 0;
      const discount = l.discount ?? 0;
      const lineTotal = qty * unitPrice - discount;
      const taxAmount = (lineTotal * taxRate) / 100;
      subtotal += lineTotal;
      return {
        productId: l.productId,
        quantity: qty,
        unitPrice: new Decimal(unitPrice),
        taxRate: taxRate ? new Decimal(taxRate) : undefined,
        taxAmount: new Decimal(taxAmount),
        discount: new Decimal(discount),
        totalPrice: new Decimal(lineTotal + taxAmount),
        quantityReceived: 0,
        quantityPending: qty,
      };
    });

    const taxAmount = 0; // could sum from items
    const totalAmount = subtotal + taxAmount;

    const po = await this.purchaseRepository.createPurchaseOrder({
      orderNumber,
      supplier: { connect: { id: dto.vendorId } },
      store: { connect: { id: dto.storeId } },
      orderDate,
      expectedDeliveryDate,
      subtotal: new Decimal(subtotal),
      taxAmount: new Decimal(taxAmount),
      discountAmount: new Decimal(0),
      totalAmount: new Decimal(totalAmount),
      currency: dto.currency ?? 'INR',
      notes: dto.notes ?? undefined,
      reference: dto.reference ?? undefined,
      status: PurchaseOrderStatus.DRAFT,
      createdByUser: currentUser?.id ? { connect: { id: currentUser.id } } : undefined,
      items: {
        create: itemsCreate,
      },
    });

    const full = await this.purchaseRepository.findPurchaseOrderById(po.id);
    return new PurchaseOrderResponseDto(full as any);
  }

  async update(
    id: string,
    dto: UpdatePurchaseOrderDto,
    currentUser?: UserResponseDto,
  ): Promise<PurchaseOrderResponseDto> {
    const existing = await this.purchaseRepository.findPurchaseOrderById(id);
    if (!existing) {
      throw new NotFoundException('Purchase order not found');
    }
    if (existing.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestException(
        'Only draft purchase orders can be updated',
      );
    }

    const updateData: any = {};
    if (dto.orderDate != null) updateData.orderDate = new Date(dto.orderDate);
    if (dto.expectedDeliveryDate != null)
      updateData.expectedDeliveryDate = new Date(dto.expectedDeliveryDate);
    if (dto.notes !== undefined) updateData.notes = dto.notes;
    if (dto.reference !== undefined) updateData.reference = dto.reference;

    if (dto.lines && dto.lines.length > 0) {
      const newItems = dto.lines
        .filter((l) => l.productId && l.quantity != null && l.unitPrice != null)
        .map((l) => {
          const qty = l.quantity!;
          const unitPrice = l.unitPrice!;
          const taxRate = l.taxRate ?? 0;
          const discount = l.discount ?? 0;
          const lineTotal = qty * unitPrice - discount;
          const taxAmount = (lineTotal * taxRate) / 100;
          return {
            productId: l.productId!,
            quantity: qty,
            unitPrice: new Decimal(unitPrice),
            taxRate: taxRate ? new Decimal(taxRate) : undefined,
            taxAmount: new Decimal(taxAmount),
            discount: new Decimal(discount),
            totalPrice: new Decimal(lineTotal + taxAmount),
            quantityReceived: 0,
            quantityPending: qty,
            _lineTotal: lineTotal + taxAmount,
          };
        });
      let newSubtotal = 0;
      let newTax = 0;
      newItems.forEach((it: any) => {
        newSubtotal += it._lineTotal - Number(it.taxAmount ?? 0);
        newTax += Number(it.taxAmount ?? 0);
      });
      const newTotal = newSubtotal + newTax;
      await this.purchaseRepository.updatePurchaseOrder(id, {
        ...updateData,
        subtotal: new Decimal(newSubtotal),
        taxAmount: new Decimal(newTax),
        totalAmount: new Decimal(newTotal),
        updatedBy: currentUser?.id ? { connect: { id: currentUser.id } } : undefined,
        items: {
          deleteMany: {},
          create: newItems.map(({ _lineTotal, ...rest }: any) => rest),
        },
      });
    } else {
      await this.purchaseRepository.updatePurchaseOrder(id, {
        ...updateData,
        updatedBy: currentUser?.id ? { connect: { id: currentUser.id } } : undefined,
      });
    }

    const updated = await this.purchaseRepository.findPurchaseOrderById(id);
    return new PurchaseOrderResponseDto(updated as any);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.purchaseRepository.findPurchaseOrderById(id);
    if (!existing) {
      throw new NotFoundException('Purchase order not found');
    }
    if (existing.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestException(
        'Only draft purchase orders can be deleted',
      );
    }
    await this.purchaseRepository.deletePurchaseOrder(id);
  }
}
