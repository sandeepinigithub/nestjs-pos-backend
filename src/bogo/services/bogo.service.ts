import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { BOGORepository } from '../repositories/bogo.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBOGODto } from '../dto/create-bogo.dto';
import { BOGOOfferResponseDto } from '../dto/bogo-response.dto';
import {
  EligibleBOGOResponseDto,
  ApplyBOGODto,
} from '../dto/apply-bogo.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import {
  BOGOType,
  BOGOStatus,
  OrderChannel,
  CustomerType,
} from '@prisma/client';
import { PaginationDto, PaginationResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class BOGOService {
  constructor(
    private bogoRepository: BOGORepository,
    private prisma: PrismaService,
  ) {}

  async create(createBOGODto: CreateBOGODto, currentUser?: UserResponseDto): Promise<BOGOOfferResponseDto> {
    // Check if code already exists
    const existing = await this.bogoRepository.findBOGOByCode(createBOGODto.code);
    if (existing) {
      throw new ConflictException('BOGO offer with this code already exists');
    }

    // Check if coupon code already exists (if provided)
    if (createBOGODto.couponCode) {
      const existingCoupon = await this.bogoRepository.findBOGOByCouponCode(createBOGODto.couponCode);
      if (existingCoupon) {
        throw new ConflictException('BOGO offer with this coupon code already exists');
      }
    }

    const bogoOffer = await this.bogoRepository.createBOGO({
      code: createBOGODto.code,
      name: createBOGODto.name,
      description: createBOGODto.description,
      type: createBOGODto.type,
      status: createBOGODto.status || BOGOStatus.ACTIVE,
      triggerConfig: createBOGODto.triggerConfig as any,
      rewardConfig: createBOGODto.rewardConfig as any,
      minBillAmount: createBOGODto.minBillAmount,
      maxFreeItems: createBOGODto.maxFreeItems,
      maxUsagePerOrder: createBOGODto.maxUsagePerOrder,
      maxUsagePerCustomer: createBOGODto.maxUsagePerCustomer,
      maxUsageTotal: createBOGODto.maxUsageTotal,
      validFrom: createBOGODto.validFrom ? new Date(createBOGODto.validFrom) : null,
      validTo: createBOGODto.validTo ? new Date(createBOGODto.validTo) : null,
      timeRestrictions: createBOGODto.timeRestrictions as any,
      orderChannels: createBOGODto.orderChannels || [],
      customerTypes: createBOGODto.customerTypes || [],
      storeIds: createBOGODto.storeIds || [],
      tenant: createBOGODto.tenantId ? { connect: { id: createBOGODto.tenantId } } : undefined,
      fallbackConfig: createBOGODto.fallbackConfig as any,
      tierConfig: createBOGODto.tierConfig as any,
      repeatable: createBOGODto.repeatable || false,
      repeatCycle: createBOGODto.repeatCycle,
      couponCode: createBOGODto.couponCode,
      requiresCoupon: createBOGODto.requiresCoupon || false,
      allowManual: createBOGODto.allowManual || false,
      priority: createBOGODto.priority || 0,
      notes: createBOGODto.notes,
      createdByUser: currentUser?.id ? { connect: { id: currentUser.id } } : undefined,
    });

    return new BOGOOfferResponseDto(bogoOffer);
  }

  async findAll(
    paginationDto: PaginationDto,
    filters?: { status?: string; type?: string; tenantId?: string },
  ): Promise<PaginationResponseDto<BOGOOfferResponseDto>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;
    if (filters?.tenantId) where.tenantId = filters.tenantId;

    const [bogoOffers, total] = await Promise.all([
      this.bogoRepository.findBOGOs({
        where,
        skip,
        take: limit,
        orderBy: { priority: 'desc' },
      }),
      this.bogoRepository.countBOGOs(where),
    ]);

    return {
      data: bogoOffers.map((offer) => new BOGOOfferResponseDto(offer)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<BOGOOfferResponseDto> {
    const bogoOffer = await this.bogoRepository.findBOGOById(id);
    if (!bogoOffer) {
      throw new NotFoundException('BOGO offer not found');
    }

    return new BOGOOfferResponseDto(bogoOffer);
  }

  async update(
    id: string,
    updateData: Partial<CreateBOGODto>,
    currentUser?: UserResponseDto,
  ): Promise<BOGOOfferResponseDto> {
    const bogoOffer = await this.bogoRepository.findBOGOById(id);
    if (!bogoOffer) {
      throw new NotFoundException('BOGO offer not found');
    }

    const updateInput: any = {};
    if (updateData.name) updateInput.name = updateData.name;
    if (updateData.description !== undefined) updateInput.description = updateData.description;
    if (updateData.status) updateInput.status = updateData.status;
    if (updateData.triggerConfig) updateInput.triggerConfig = updateData.triggerConfig as any;
    if (updateData.rewardConfig) updateInput.rewardConfig = updateData.rewardConfig as any;
    if (updateData.minBillAmount !== undefined) updateInput.minBillAmount = updateData.minBillAmount;
    if (updateData.maxFreeItems !== undefined) updateInput.maxFreeItems = updateData.maxFreeItems;
    if (updateData.validFrom) updateInput.validFrom = new Date(updateData.validFrom);
    if (updateData.validTo) updateInput.validTo = new Date(updateData.validTo);
    if (updateData.priority !== undefined) updateInput.priority = updateData.priority;
    if (updateData.notes !== undefined) updateInput.notes = updateData.notes;

    if (currentUser?.id) {
      updateInput.updatedBy = currentUser.id;
    }

    const updated = await this.bogoRepository.updateBOGO(id, updateInput);
    return new BOGOOfferResponseDto(updated);
  }

  async remove(id: string): Promise<void> {
    const bogoOffer = await this.bogoRepository.findBOGOById(id);
    if (!bogoOffer) {
      throw new NotFoundException('BOGO offer not found');
    }

    await this.bogoRepository.deleteBOGO(id);
  }

  async getEligibleOffers(
    orderId: string,
    customerId?: string,
    couponCode?: string,
  ): Promise<EligibleBOGOResponseDto[]> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        store: true,
        customer: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Get all active BOGO offers
    const where: any = {
      status: BOGOStatus.ACTIVE,
      isActive: true,
      OR: [
        { tenantId: null },
        { tenantId: order.store.tenantId },
      ],
    };

    // Filter by store if location-specific
    const bogoOffers = await this.bogoRepository.findBOGOs({
      where,
      orderBy: { priority: 'desc' },
    });

    const eligibleOffers: EligibleBOGOResponseDto[] = [];

    for (const offer of bogoOffers) {
      const isEligible = await this.checkEligibility(offer, order, customerId, couponCode);
      if (isEligible.eligible) {
        const discountInfo = await this.calculateDiscount(offer, order);
        eligibleOffers.push({
          bogoOfferId: offer.id,
          code: offer.code,
          name: offer.name,
          type: offer.type,
          description: offer.description || undefined,
          discountAmount: discountInfo.discountAmount,
          freeItems: discountInfo.freeItems,
          requiresSelection: offer.type === BOGOType.CUSTOMER_CHOICE,
          selectableProducts: discountInfo.selectableProducts,
        });
      }
    }

    return eligibleOffers;
  }

  async applyBOGO(
    orderId: string,
    applyBOGODto: ApplyBOGODto,
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
        customer: true,
        bogoApplications: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    let bogoOffer: any;

    // Find BOGO offer
    if (applyBOGODto.bogoOfferId) {
      bogoOffer = await this.bogoRepository.findBOGOById(applyBOGODto.bogoOfferId);
    } else if (applyBOGODto.couponCode) {
      bogoOffer = await this.bogoRepository.findBOGOByCouponCode(applyBOGODto.couponCode);
    } else {
      throw new BadRequestException('Either bogoOfferId or couponCode must be provided');
    }

    if (!bogoOffer) {
      throw new NotFoundException('BOGO offer not found');
    }

    // Check eligibility
    const eligibility = await this.checkEligibility(
      bogoOffer,
      order,
      order.customerId || undefined,
      applyBOGODto.couponCode,
    );

    if (!eligibility.eligible) {
      throw new BadRequestException(`BOGO offer is not eligible: ${eligibility.reason}`);
    }

    // Check manual application
    if (applyBOGODto.isManual && !bogoOffer.allowManual) {
      throw new BadRequestException('Manual application not allowed for this offer');
    }

    // Check usage limits
    if (bogoOffer.maxUsagePerOrder) {
      const applicationsInOrder = order.bogoApplications.filter(
        (app) => app.bogoOfferId === bogoOffer.id,
      ).length;
      if (applicationsInOrder >= bogoOffer.maxUsagePerOrder) {
        throw new BadRequestException('Maximum usage per order reached');
      }
    }

    if (bogoOffer.maxUsageTotal && bogoOffer.usageCount >= bogoOffer.maxUsageTotal) {
      throw new BadRequestException('Maximum total usage reached');
    }

    // Calculate and apply discount
    const discountInfo = await this.calculateDiscount(bogoOffer, order, applyBOGODto.selectedProductIds);

    // Apply discount to order
    const newDiscountAmount = Number(order.discountAmount) + discountInfo.discountAmount;
    const newTotalAmount = Number(order.totalAmount) - discountInfo.discountAmount;

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        discountAmount: newDiscountAmount,
        totalAmount: newTotalAmount,
      },
    });

    // Create BOGO application record
    const application = await this.bogoRepository.createApplication({
      bogoOffer: { connect: { id: bogoOffer.id } },
      order: { connect: { id: orderId } },
      discountAmount: discountInfo.discountAmount,
      freeItemsCount: discountInfo.freeItems.reduce((sum, item) => sum + item.quantity, 0),
      applicationDetails: discountInfo as any,
      isManual: applyBOGODto.isManual || false,
      couponCode: applyBOGODto.couponCode,
      appliedByUser: { connect: { id: currentUser.id } },
    });

    // Increment usage count
    await this.bogoRepository.incrementUsage(bogoOffer.id);

    // Handle next-visit voucher (Case 25)
    if (bogoOffer.type === BOGOType.NEXT_VISIT_VOUCHER) {
      const voucherCode = await this.bogoRepository.generateVoucherCode();
      await this.bogoRepository.createVoucher({
        voucherCode,
        bogoOffer: { connect: { id: bogoOffer.id } },
        order: { connect: { id: orderId } },
        customer: order.customerId ? { connect: { id: order.customerId } } : undefined,
        status: 'PENDING',
        rewardConfig: bogoOffer.rewardConfig,
        validFrom: new Date(),
        validTo: bogoOffer.validTo || null,
      });
    }

    return {
      application,
      discountApplied: discountInfo.discountAmount,
      freeItems: discountInfo.freeItems,
      newTotalAmount,
    };
  }

  private async checkEligibility(
    offer: any,
    order: any,
    customerId?: string,
    couponCode?: string,
  ): Promise<{ eligible: boolean; reason?: string }> {
    const now = new Date();

    // Check status
    if (offer.status !== BOGOStatus.ACTIVE || !offer.isActive) {
      return { eligible: false, reason: 'Offer is not active' };
    }

    // Check validity dates
    if (offer.validFrom && new Date(offer.validFrom) > now) {
      return { eligible: false, reason: 'Offer not yet valid' };
    }
    if (offer.validTo && new Date(offer.validTo) < now) {
      return { eligible: false, reason: 'Offer expired' };
    }

    // Check time restrictions (Case 12)
    if (offer.timeRestrictions) {
      const restrictions = offer.timeRestrictions as any;
      const currentTime = now.toTimeString().substring(0, 5); // HH:mm
      const currentDay = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][now.getDay()];

      if (restrictions.startTime && restrictions.endTime) {
        if (currentTime < restrictions.startTime || currentTime > restrictions.endTime) {
          return { eligible: false, reason: 'Outside valid time window' };
        }
      }

      if (restrictions.days && !restrictions.days.includes(currentDay)) {
        return { eligible: false, reason: 'Not valid on this day' };
      }
    }

    // Check channel restrictions (Case 13)
    if (offer.orderChannels && offer.orderChannels.length > 0) {
      if (!offer.orderChannels.includes(order.orderType as any) && !offer.orderChannels.includes('ALL' as any)) {
        return { eligible: false, reason: 'Not valid for this order channel' };
      }
    }

    // Check location restrictions (Case 23)
    if (offer.storeIds && offer.storeIds.length > 0) {
      if (!offer.storeIds.includes(order.storeId)) {
        return { eligible: false, reason: 'Not valid for this store' };
      }
    }

    // Check coupon code (Case 17)
    if (offer.requiresCoupon) {
      if (!couponCode || couponCode !== offer.couponCode) {
        return { eligible: false, reason: 'Invalid or missing coupon code' };
      }
    }

    // Check customer type (Case 14)
    if (offer.customerTypes && offer.customerTypes.length > 0) {
      if (!customerId) {
        return { eligible: false, reason: 'Customer type restriction requires registered customer' };
      }
      // This would need customer order history to determine type
      // For now, we'll allow if customer exists
    }

    // Check minimum bill amount (Cases 10, 11, 24)
    if (offer.minBillAmount) {
      if (Number(order.totalAmount) < Number(offer.minBillAmount)) {
        return { eligible: false, reason: `Minimum bill amount of ${offer.minBillAmount} not met` };
      }
    }

    // Check trigger conditions based on type
    const triggerCheck = await this.checkTriggerConditions(offer, order);
    if (!triggerCheck.eligible) {
      return triggerCheck;
    }

    return { eligible: true };
  }

  private async checkTriggerConditions(
    offer: any,
    order: any,
  ): Promise<{ eligible: boolean; reason?: string }> {
    const triggerConfig = offer.triggerConfig as any;
    const orderItems = order.orderItems || [];

    switch (offer.type) {
      case BOGOType.BUY_X_GET_X_SAME:
      case BOGOType.BUY_X_GET_Y_DIFFERENT:
      case BOGOType.BUY_X_GET_Y_PERCENT_OFF:
      case BOGOType.BUY_X_GET_Y_FLAT_PRICE:
        // Check if trigger products are in order
        if (triggerConfig.productIds) {
          const hasTriggerProduct = orderItems.some((item: any) =>
            triggerConfig.productIds.includes(item.productId),
          );
          if (!hasTriggerProduct) {
            return { eligible: false, reason: 'Trigger product not in order' };
          }
          // Check quantity
          if (triggerConfig.quantity) {
            const totalQty = orderItems
              .filter((item: any) => triggerConfig.productIds.includes(item.productId))
              .reduce((sum: number, item: any) => sum + item.quantity, 0);
            if (totalQty < triggerConfig.quantity) {
              return { eligible: false, reason: 'Insufficient trigger quantity' };
            }
          }
        }
        break;

      case BOGOType.CATEGORY_BASED:
        if (triggerConfig.categoryIds) {
          const hasCategoryProduct = orderItems.some((item: any) =>
            triggerConfig.categoryIds.includes(item.product.categoryId),
          );
          if (!hasCategoryProduct) {
            return { eligible: false, reason: 'No products from trigger category' };
          }
        }
        break;

      case BOGOType.BUY_COMBO_GET_FREE:
        if (triggerConfig.comboItems) {
          const comboItems = triggerConfig.comboItems as Array<{ productId: string; quantity: number }>;
          for (const comboItem of comboItems) {
            const orderItem = orderItems.find((item: any) => item.productId === comboItem.productId);
            if (!orderItem || orderItem.quantity < comboItem.quantity) {
              return { eligible: false, reason: 'Combo items not satisfied' };
            }
          }
        }
        break;

      case BOGOType.MIX_MATCH_GROUP:
        if (triggerConfig.groupItems) {
          const groupProductIds = triggerConfig.groupItems as string[];
          const groupItemsInOrder = orderItems.filter((item: any) =>
            groupProductIds.includes(item.productId),
          );
          const totalQty = groupItemsInOrder.reduce((sum: number, item: any) => sum + item.quantity, 0);
          if (totalQty < (triggerConfig.quantity || 1)) {
            return { eligible: false, reason: 'Mix & match quantity not met' };
          }
        }
        break;

      case BOGOType.BILL_AMOUNT_FREE_ITEM:
      case BOGOType.BILL_AMOUNT_DISCOUNT:
        // Already checked minBillAmount above
        break;

      case BOGOType.QTY_BILL_CONDITION:
        // Check both quantity and bill amount
        if (triggerConfig.productIds && triggerConfig.quantity) {
          const totalQty = orderItems
            .filter((item: any) => triggerConfig.productIds.includes(item.productId))
            .reduce((sum: number, item: any) => sum + item.quantity, 0);
          if (totalQty < triggerConfig.quantity) {
            return { eligible: false, reason: 'Quantity condition not met' };
          }
        }
        // Bill amount already checked
        break;
    }

    return { eligible: true };
  }

  private async calculateDiscount(
    offer: any,
    order: any,
    selectedProductIds?: string[],
  ): Promise<{
    discountAmount: number;
    freeItems: Array<{ productId: string; productName: string; quantity: number }>;
    selectableProducts?: Array<{ productId: string; productName: string; maxPrice?: number }>;
  }> {
    const rewardConfig = offer.rewardConfig as any;
    const orderItems = order.orderItems || [];
    let discountAmount = 0;
    const freeItems: Array<{ productId: string; productName: string; quantity: number }> = [];

    switch (offer.type) {
      case BOGOType.BUY_X_GET_X_SAME: {
        // Case 1: Buy X → Get X (Same Item Free)
        const triggerConfig = offer.triggerConfig as any;
        if (triggerConfig.productIds && triggerConfig.quantity) {
          for (const productId of triggerConfig.productIds) {
            const orderItem = orderItems.find((item: any) => item.productId === productId);
            if (orderItem) {
              const freeQty = Math.floor(orderItem.quantity / triggerConfig.quantity);
              if (freeQty > 0) {
                const product = await this.prisma.product.findUnique({
                  where: { id: productId },
                });
                if (product) {
                  const maxFree = offer.maxFreeItems ? Math.min(freeQty, offer.maxFreeItems) : freeQty;
                  const unitPrice = Number(orderItem.unitPrice);
                  discountAmount += unitPrice * maxFree;
                  freeItems.push({
                    productId,
                    productName: product.name,
                    quantity: maxFree,
                  });
                }
              }
            }
          }
        }
        break;
      }

      case BOGOType.BUY_X_GET_Y_DIFFERENT: {
        // Case 2: Buy X → Get Y (Different Item Free)
        const triggerConfig = offer.triggerConfig as any;
        const rewardProductIds = rewardConfig.productIds as string[];
        if (triggerConfig.productIds && rewardProductIds) {
          // Check trigger quantity
          const triggerQty = orderItems
            .filter((item: any) => triggerConfig.productIds.includes(item.productId))
            .reduce((sum: number, item: any) => sum + item.quantity, 0);

          if (triggerQty >= (triggerConfig.quantity || 1)) {
            // Find reward products in order
            for (const rewardProductId of rewardProductIds) {
              const orderItem = orderItems.find((item: any) => item.productId === rewardProductId);
              if (orderItem) {
                const freeQty = Math.min(orderItem.quantity, rewardConfig.quantity || 1);
                const maxFree = offer.maxFreeItems ? Math.min(freeQty, offer.maxFreeItems) : freeQty;
                const unitPrice = Number(orderItem.unitPrice);
                discountAmount += unitPrice * maxFree;
                freeItems.push({
                  productId: rewardProductId,
                  productName: orderItem.product.name,
                  quantity: maxFree,
                });
                break; // Apply to first matching reward product
              }
            }
          }
        }
        break;
      }

      case BOGOType.BUY_X_GET_Y_PERCENT_OFF: {
        // Case 3: Buy X → Get % Off on Y
        const triggerConfig = offer.triggerConfig as any;
        const rewardProductIds = rewardConfig.productIds as string[];
        if (triggerConfig.productIds && rewardProductIds) {
          const triggerQty = orderItems
            .filter((item: any) => triggerConfig.productIds.includes(item.productId))
            .reduce((sum: number, item: any) => sum + item.quantity, 0);

          if (triggerQty >= (triggerConfig.quantity || 1)) {
            for (const rewardProductId of rewardProductIds) {
              const orderItem = orderItems.find((item: any) => item.productId === rewardProductId);
              if (orderItem && rewardConfig.discountPercent) {
                const discountPercent = rewardConfig.discountPercent;
                const unitPrice = Number(orderItem.unitPrice);
                const itemDiscount = (unitPrice * discountPercent) / 100;
                discountAmount += itemDiscount * orderItem.quantity;
                break;
              }
            }
          }
        }
        break;
      }

      case BOGOType.BUY_X_GET_Y_FLAT_PRICE: {
        // Case 5: Buy X → Get Y at Flat Price
        const triggerConfig = offer.triggerConfig as any;
        const rewardProductIds = rewardConfig.productIds as string[];
        if (triggerConfig.productIds && rewardProductIds && rewardConfig.flatPrice) {
          const triggerQty = orderItems
            .filter((item: any) => triggerConfig.productIds.includes(item.productId))
            .reduce((sum: number, item: any) => sum + item.quantity, 0);

          if (triggerQty >= (triggerConfig.quantity || 1)) {
            for (const rewardProductId of rewardProductIds) {
              const orderItem = orderItems.find((item: any) => item.productId === rewardProductId);
              if (orderItem) {
                const unitPrice = Number(orderItem.unitPrice);
                const flatPrice = rewardConfig.flatPrice;
                const discountPerItem = unitPrice - flatPrice;
                discountAmount += discountPerItem * orderItem.quantity;
                break;
              }
            }
          }
        }
        break;
      }

      case BOGOType.REPEATABLE_MULTI_CYCLE: {
        // Case 6: Repeatable BOGO (Multi-Cycle)
        const triggerConfig = offer.triggerConfig as any;
        if (triggerConfig.productIds && offer.repeatCycle) {
          for (const productId of triggerConfig.productIds) {
            const orderItem = orderItems.find((item: any) => item.productId === productId);
            if (orderItem) {
              const cycles = Math.floor(orderItem.quantity / offer.repeatCycle);
              const freeQty = cycles; // Assuming Buy 2 Get 1 = cycle of 3, so 1 free per cycle
              if (freeQty > 0) {
                const product = await this.prisma.product.findUnique({
                  where: { id: productId },
                });
                if (product) {
                  const maxFree = offer.maxFreeItems ? Math.min(freeQty, offer.maxFreeItems) : freeQty;
                  const unitPrice = Number(orderItem.unitPrice);
                  discountAmount += unitPrice * maxFree;
                  freeItems.push({
                    productId,
                    productName: product.name,
                    quantity: maxFree,
                  });
                }
              }
            }
          }
        }
        break;
      }

      case BOGOType.SLAB_BASED: {
        // Case 18: Slab-Based BOGO
        const triggerConfig = offer.triggerConfig as any;
        const slabs = rewardConfig.slabs as Array<{ buyQty: number; getQty: number }>;
        if (triggerConfig.productIds && slabs) {
          for (const productId of triggerConfig.productIds) {
            const orderItem = orderItems.find((item: any) => item.productId === productId);
            if (orderItem) {
              // Find applicable slab
              for (const slab of slabs.sort((a, b) => b.buyQty - a.buyQty)) {
                if (orderItem.quantity >= slab.buyQty) {
                  const freeQty = slab.getQty;
                  const product = await this.prisma.product.findUnique({
                    where: { id: productId },
                  });
                  if (product) {
                    const maxFree = offer.maxFreeItems ? Math.min(freeQty, offer.maxFreeItems) : freeQty;
                    const unitPrice = Number(orderItem.unitPrice);
                    discountAmount += unitPrice * maxFree;
                    freeItems.push({
                      productId,
                      productName: product.name,
                      quantity: maxFree,
                    });
                  }
                  break;
                }
              }
            }
          }
        }
        break;
      }

      case BOGOType.CUSTOMER_CHOICE: {
        // Case 19: Buy X → Customer Chooses Free Item
        const triggerConfig = offer.triggerConfig as any;
        const selectableProductIds = rewardConfig.productIds as string[];
        if (triggerConfig.productIds && selectableProductIds) {
          const triggerQty = orderItems
            .filter((item: any) => triggerConfig.productIds.includes(item.productId))
            .reduce((sum: number, item: any) => sum + item.quantity, 0);

          if (triggerQty >= (triggerConfig.quantity || 1)) {
            if (selectedProductIds && selectedProductIds.length > 0) {
              // Customer selected products
              for (const selectedProductId of selectedProductIds) {
                if (selectableProductIds.includes(selectedProductId)) {
                  const orderItem = orderItems.find((item: any) => item.productId === selectedProductId);
                  if (orderItem) {
                    const maxPrice = rewardConfig.maxPrice;
                    const unitPrice = Number(orderItem.unitPrice);
                    if (!maxPrice || unitPrice <= maxPrice) {
                      const freeQty = rewardConfig.quantity || 1;
                      const maxFree = offer.maxFreeItems ? Math.min(freeQty, offer.maxFreeItems) : freeQty;
                      discountAmount += unitPrice * maxFree;
                      freeItems.push({
                        productId: selectedProductId,
                        productName: orderItem.product.name,
                        quantity: maxFree,
                      });
                    }
                  }
                }
              }
            } else {
              // Return selectable products for customer to choose
              const products = await this.prisma.product.findMany({
                where: { id: { in: selectableProductIds } },
              });
              return {
                discountAmount: 0,
                freeItems: [],
                selectableProducts: products.map((p) => ({
                  productId: p.id,
                  productName: p.name,
                  maxPrice: rewardConfig.maxPrice,
                })),
              };
            }
          }
        }
        break;
      }

      case BOGOType.BILL_AMOUNT_FREE_ITEM: {
        // Case 10: Bill Amount → Free Item
        const rewardProductIds = rewardConfig.productIds as string[];
        if (rewardProductIds) {
          for (const rewardProductId of rewardProductIds) {
            const orderItem = orderItems.find((item: any) => item.productId === rewardProductId);
            if (orderItem) {
              const freeQty = rewardConfig.quantity || 1;
              const maxFree = offer.maxFreeItems ? Math.min(freeQty, offer.maxFreeItems) : freeQty;
              const unitPrice = Number(orderItem.unitPrice);
              discountAmount += unitPrice * maxFree;
              freeItems.push({
                productId: rewardProductId,
                productName: orderItem.product.name,
                quantity: maxFree,
              });
              break;
            }
          }
        }
        break;
      }

      case BOGOType.BILL_AMOUNT_DISCOUNT: {
        // Case 11: Bill Amount → Discount on Item
        const rewardProductIds = rewardConfig.productIds as string[];
        if (rewardProductIds) {
          for (const rewardProductId of rewardProductIds) {
            const orderItem = orderItems.find((item: any) => item.productId === rewardProductId);
            if (orderItem) {
              if (rewardConfig.discountPercent) {
                const discountPercent = rewardConfig.discountPercent;
                const unitPrice = Number(orderItem.unitPrice);
                const itemDiscount = (unitPrice * discountPercent) / 100;
                discountAmount += itemDiscount * orderItem.quantity;
              } else if (rewardConfig.flatPrice) {
                const unitPrice = Number(orderItem.unitPrice);
                const flatPrice = rewardConfig.flatPrice;
                const discountPerItem = unitPrice - flatPrice;
                discountAmount += discountPerItem * orderItem.quantity;
              }
              break;
            }
          }
        }
        break;
      }

      case BOGOType.CATEGORY_BASED: {
        // Case 9: Category-Based BOGO
        const triggerConfig = offer.triggerConfig as any;
        const rewardCategoryIds = rewardConfig.categoryIds as string[];
        if (triggerConfig.categoryIds && rewardCategoryIds) {
          // Check if trigger category products exist
          const hasTriggerCategory = orderItems.some((item: any) =>
            triggerConfig.categoryIds.includes(item.product.categoryId),
          );
          if (hasTriggerCategory) {
            // Apply to reward category products
            for (const categoryId of rewardCategoryIds) {
              const categoryItems = orderItems.filter(
                (item: any) => item.product.categoryId === categoryId,
              );
              for (const orderItem of categoryItems) {
                const freeQty = rewardConfig.quantity || 1;
                const maxFree = offer.maxFreeItems ? Math.min(freeQty, offer.maxFreeItems) : freeQty;
                const unitPrice = Number(orderItem.unitPrice);
                discountAmount += unitPrice * maxFree;
                freeItems.push({
                  productId: orderItem.productId,
                  productName: orderItem.product.name,
                  quantity: maxFree,
                });
                break; // Apply to first item in category
              }
            }
          }
        }
        break;
      }

      case BOGOType.BUY_COMBO_GET_FREE: {
        // Case 4: Buy Combo → Get Free Item
        const triggerConfig = offer.triggerConfig as any;
        const rewardProductIds = rewardConfig.productIds as string[];
        if (triggerConfig.comboItems && rewardProductIds) {
          // Combo already validated in checkTriggerConditions
          for (const rewardProductId of rewardProductIds) {
            const orderItem = orderItems.find((item: any) => item.productId === rewardProductId);
            if (orderItem) {
              const freeQty = rewardConfig.quantity || 1;
              const maxFree = offer.maxFreeItems ? Math.min(freeQty, offer.maxFreeItems) : freeQty;
              const unitPrice = Number(orderItem.unitPrice);
              discountAmount += unitPrice * maxFree;
              freeItems.push({
                productId: rewardProductId,
                productName: orderItem.product.name,
                quantity: maxFree,
              });
              break;
            }
          }
        }
        break;
      }

      case BOGOType.MIX_MATCH_GROUP: {
        // Case 8: Mix & Match BOGO
        const triggerConfig = offer.triggerConfig as any;
        const rewardProductIds = rewardConfig.productIds as string[];
        if (triggerConfig.groupItems && rewardProductIds) {
          // Group already validated
          for (const rewardProductId of rewardProductIds) {
            const orderItem = orderItems.find((item: any) => item.productId === rewardProductId);
            if (orderItem) {
              const freeQty = rewardConfig.quantity || 1;
              const maxFree = offer.maxFreeItems ? Math.min(freeQty, offer.maxFreeItems) : freeQty;
              const unitPrice = Number(orderItem.unitPrice);
              discountAmount += unitPrice * maxFree;
              freeItems.push({
                productId: rewardProductId,
                productName: orderItem.product.name,
                quantity: maxFree,
              });
              break;
            }
          }
        }
        break;
      }

      case BOGOType.MAX_PRICE_RULE: {
        // Case 22: BOGO with Maximum Price Rule
        const triggerConfig = offer.triggerConfig as any;
        const rewardProductIds = rewardConfig.productIds as string[];
        if (triggerConfig.productIds && rewardProductIds && rewardConfig.maxPrice) {
          const triggerQty = orderItems
            .filter((item: any) => triggerConfig.productIds.includes(item.productId))
            .reduce((sum: number, item: any) => sum + item.quantity, 0);

          if (triggerQty >= (triggerConfig.quantity || 1)) {
            for (const rewardProductId of rewardProductIds) {
              const orderItem = orderItems.find((item: any) => item.productId === rewardProductId);
              if (orderItem) {
                const unitPrice = Number(orderItem.unitPrice);
                if (unitPrice <= rewardConfig.maxPrice) {
                  const freeQty = rewardConfig.quantity || 1;
                  const maxFree = offer.maxFreeItems ? Math.min(freeQty, offer.maxFreeItems) : freeQty;
                  discountAmount += unitPrice * maxFree;
                  freeItems.push({
                    productId: rewardProductId,
                    productName: orderItem.product.name,
                    quantity: maxFree,
                  });
                  break;
                }
              }
            }
          }
        }
        break;
      }

      case BOGOType.PROGRESSIVE_DISCOUNT: {
        // Case 20: Progressive Discount BOGO
        const triggerConfig = offer.triggerConfig as any;
        const tiers = offer.tierConfig?.tiers as Array<{ minQty: number; reward: any }>;
        if (triggerConfig.productIds && tiers) {
          for (const productId of triggerConfig.productIds) {
            const orderItem = orderItems.find((item: any) => item.productId === productId);
            if (orderItem) {
              // Find applicable tier
              for (const tier of tiers.sort((a, b) => b.minQty - a.minQty)) {
                if (orderItem.quantity >= tier.minQty) {
                  const reward = tier.reward;
                  if (reward.discountPercent) {
                    const unitPrice = Number(orderItem.unitPrice);
                    const itemDiscount = (unitPrice * reward.discountPercent) / 100;
                    discountAmount += itemDiscount * orderItem.quantity;
                  } else if (reward.quantity) {
                    // Free items
                    const product = await this.prisma.product.findUnique({
                      where: { id: productId },
                    });
                    if (product) {
                      const unitPrice = Number(orderItem.unitPrice);
                      discountAmount += unitPrice * reward.quantity;
                      freeItems.push({
                        productId,
                        productName: product.name,
                        quantity: reward.quantity,
                      });
                    }
                  }
                  break;
                }
              }
            }
          }
        }
        break;
      }

      case BOGOType.TIERED_MULTI_LEVEL: {
        // Case 21: Tiered BOGO (Multi-Level Rewards)
        const triggerConfig = offer.triggerConfig as any;
        const tiers = offer.tierConfig?.tiers as Array<{ minQty: number; reward: any }>;
        if (triggerConfig.productIds && tiers) {
          for (const productId of triggerConfig.productIds) {
            const orderItem = orderItems.find((item: any) => item.productId === productId);
            if (orderItem) {
              // Apply all applicable tiers
              for (const tier of tiers.sort((a, b) => a.minQty - b.minQty)) {
                if (orderItem.quantity >= tier.minQty) {
                  const reward = tier.reward;
                  if (reward.productIds) {
                    for (const rewardProductId of reward.productIds) {
                      const rewardItem = orderItems.find((item: any) => item.productId === rewardProductId);
                      if (rewardItem) {
                        const freeQty = reward.quantity || 1;
                        const unitPrice = Number(rewardItem.unitPrice);
                        discountAmount += unitPrice * freeQty;
                        freeItems.push({
                          productId: rewardProductId,
                          productName: rewardItem.product.name,
                          quantity: freeQty,
                        });
                      }
                    }
                  }
                }
              }
            }
          }
        }
        break;
      }

      case BOGOType.QTY_BILL_CONDITION: {
        // Case 24: BOGO with Qty + Bill Amount Condition
        const triggerConfig = offer.triggerConfig as any;
        const rewardProductIds = rewardConfig.productIds as string[];
        if (triggerConfig.productIds && rewardProductIds) {
          // Both conditions already validated
          for (const rewardProductId of rewardProductIds) {
            const orderItem = orderItems.find((item: any) => item.productId === rewardProductId);
            if (orderItem) {
              const freeQty = rewardConfig.quantity || 1;
              const maxFree = offer.maxFreeItems ? Math.min(freeQty, offer.maxFreeItems) : freeQty;
              const unitPrice = Number(orderItem.unitPrice);
              discountAmount += unitPrice * maxFree;
              freeItems.push({
                productId: rewardProductId,
                productName: orderItem.product.name,
                quantity: maxFree,
              });
              break;
            }
          }
        }
        break;
      }

      case BOGOType.NEXT_VISIT_VOUCHER: {
        // Case 25: Next-Visit BOGO (Voucher Based)
        // This creates a voucher, discount is applied when voucher is redeemed
        // For now, return 0 discount (voucher will be created in applyBOGO)
        break;
      }

      case BOGOType.FALLBACK_ITEM: {
        // Case 16: Fallback Item BOGO
        const triggerConfig = offer.triggerConfig as any;
        const rewardProductIds = rewardConfig.productIds as string[];
        const fallbackProductIds = offer.fallbackConfig?.fallbackProductIds as string[];

        if (triggerConfig.productIds && rewardProductIds) {
          // Try primary reward product
          let rewardApplied = false;
          for (const rewardProductId of rewardProductIds) {
            const orderItem = orderItems.find((item: any) => item.productId === rewardProductId);
            if (orderItem) {
              const freeQty = rewardConfig.quantity || 1;
              const unitPrice = Number(orderItem.unitPrice);
              discountAmount += unitPrice * freeQty;
              freeItems.push({
                productId: rewardProductId,
                productName: orderItem.product.name,
                quantity: freeQty,
              });
              rewardApplied = true;
              break;
            }
          }

          // If primary not found, use fallback
          if (!rewardApplied && fallbackProductIds) {
            for (const fallbackProductId of fallbackProductIds) {
              const orderItem = orderItems.find((item: any) => item.productId === fallbackProductId);
              if (orderItem) {
                const freeQty = rewardConfig.quantity || 1;
                const unitPrice = Number(orderItem.unitPrice);
                discountAmount += unitPrice * freeQty;
                freeItems.push({
                  productId: fallbackProductId,
                  productName: orderItem.product.name,
                  quantity: freeQty,
                });
                break;
              }
            }
          }
        }
        break;
      }
    }

    return {
      discountAmount,
      freeItems,
    };
  }

  async redeemVoucher(
    voucherCode: string,
    orderId: string,
    currentUser: UserResponseDto,
  ): Promise<any> {
    const voucher = await this.bogoRepository.findVoucherByCode(voucherCode);
    if (!voucher) {
      throw new NotFoundException('Voucher not found');
    }

    if (voucher.status !== 'PENDING') {
      throw new BadRequestException('Voucher already redeemed or expired');
    }

    if (voucher.validTo && new Date(voucher.validTo) < new Date()) {
      throw new BadRequestException('Voucher has expired');
    }

    // Get order
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Apply voucher reward
    const rewardConfig = voucher.rewardConfig as any;
    const rewardProductIds = rewardConfig.productIds as string[];
    let discountAmount = 0;

    if (rewardProductIds) {
      for (const rewardProductId of rewardProductIds) {
        const orderItem = order.orderItems.find((item: any) => item.productId === rewardProductId);
        if (orderItem) {
          const freeQty = rewardConfig.quantity || 1;
          const unitPrice = Number(orderItem.unitPrice);
          discountAmount += unitPrice * freeQty;
          break;
        }
      }
    }

    // Update order
    const newDiscountAmount = Number(order.discountAmount) + discountAmount;
    const newTotalAmount = Number(order.totalAmount) - discountAmount;

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        discountAmount: newDiscountAmount,
        totalAmount: newTotalAmount,
      },
    });

    // Redeem voucher
    const redeemedVoucher = await this.bogoRepository.redeemVoucher(
      voucherCode,
      orderId,
      currentUser.id,
    );

    return {
      voucher: redeemedVoucher,
      discountApplied: discountAmount,
      newTotalAmount,
    };
  }

  async getCustomerVouchers(customerId: string): Promise<any[]> {
    return this.bogoRepository.findVouchersByCustomer(customerId);
  }
}
