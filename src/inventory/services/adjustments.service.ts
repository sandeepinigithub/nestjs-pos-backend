import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdjustmentStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { AdjustmentRepository } from '../repositories/adjustment.repository';
import { InventoryRepository } from '../repositories/inventory.repository';
import { CreateAdjustmentDto } from '../dto/create-adjustment.dto';
import { UpdateAdjustmentDto } from '../dto/update-adjustment.dto';
import { AdjustmentResponseDto } from '../dto/adjustment-response.dto';
import { ListAdjustmentsQueryDto } from '../dto/list-adjustments-query.dto';
import { PaginationResponseDto } from '../../common/dto/pagination.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { InventoryMovementType } from '@prisma/client';

@Injectable()
export class AdjustmentsService {
  constructor(
    private readonly adjustmentRepository: AdjustmentRepository,
    private readonly inventoryRepository: InventoryRepository,
  ) {}

  async findAll(
    query: ListAdjustmentsQueryDto,
    _currentUser?: UserResponseDto,
  ): Promise<PaginationResponseDto<AdjustmentResponseDto>> {
    const { page = 1, limit = 10, storeId, status, from, to } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (storeId) where.storeId = storeId;
    if (status && status !== 'all') {
      if (status === 'draft') where.status = AdjustmentStatus.DRAFT;
      if (status === 'completed' || status === 'adjusted')
        where.status = AdjustmentStatus.COMPLETED;
    }
    if (from || to) {
      where.adjustmentDate = {};
      if (from) where.adjustmentDate.gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        where.adjustmentDate.lte = toDate;
      }
    }

    const [adjustments, total] = await Promise.all([
      this.adjustmentRepository.findMany({
        where,
        orderBy: { adjustmentDate: 'desc' },
        skip,
        take: limit,
      }),
      this.adjustmentRepository.count(where),
    ]);

    return {
      data: adjustments.map((a) => new AdjustmentResponseDto(a)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<AdjustmentResponseDto> {
    const adjustment = await this.adjustmentRepository.findById(id);
    if (!adjustment) {
      throw new NotFoundException('Adjustment not found');
    }
    return new AdjustmentResponseDto(adjustment);
  }

  async create(
    dto: CreateAdjustmentDto,
    currentUser?: UserResponseDto,
  ): Promise<AdjustmentResponseDto> {
    if (!dto.lines?.length) {
      throw new BadRequestException('At least one line item is required');
    }

    const adjustmentNumber = await this.adjustmentRepository.getNextAdjustmentNumber(
      dto.storeId,
    );
    const status =
      dto.status === 'completed' ? AdjustmentStatus.COMPLETED : AdjustmentStatus.DRAFT;
    const adjustmentDate = new Date(dto.adjustmentDate);

    let totalValue: number | null = null;
    if (dto.lines.some((l) => l.unitCost != null)) {
      totalValue = dto.lines.reduce(
        (sum, l) => sum + (l.quantityDelta ?? 0) * (l.unitCost ?? 0),
        0,
      );
    }

    const adjustment = await this.adjustmentRepository.create({
      adjustmentNumber,
      store: { connect: { id: dto.storeId } },
      adjustmentDate,
      reason: dto.reason,
      reference: dto.reference ?? undefined,
      status,
      totalValue: totalValue != null ? new Decimal(totalValue) : undefined,
      notes: dto.notes ?? undefined,
      createdByUser: currentUser?.id ? { connect: { id: currentUser.id } } : undefined,
      lines: {
        create: dto.lines.map((l) => ({
          productId: l.productId,
          quantityDelta: l.quantityDelta,
          unitCost: l.unitCost != null ? new Decimal(l.unitCost) : undefined,
          notes: l.notes,
        })),
      },
    });

    if (status === AdjustmentStatus.COMPLETED) {
      await this.applyAdjustment(adjustment.id, currentUser);
    }

    const full = await this.adjustmentRepository.findById(adjustment.id);
    return new AdjustmentResponseDto(full ?? adjustment);
  }

  async update(
    id: string,
    dto: UpdateAdjustmentDto,
    currentUser?: UserResponseDto,
  ): Promise<AdjustmentResponseDto> {
    const existing = await this.adjustmentRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Adjustment not found');
    }
    if (existing.status === AdjustmentStatus.COMPLETED) {
      throw new BadRequestException('Cannot update a completed adjustment');
    }

    const statusUpdate =
      dto.status === 'completed' ? AdjustmentStatus.COMPLETED : undefined;
    const lines = dto.lines;
    const updateData: any = {};
    if (dto.adjustmentDate != null) updateData.adjustmentDate = new Date(dto.adjustmentDate);
    if (dto.reason != null) updateData.reason = dto.reason;
    if (dto.reference !== undefined) updateData.reference = dto.reference;
    if (dto.notes !== undefined) updateData.notes = dto.notes;
    if (statusUpdate != null) updateData.status = statusUpdate;

    if (lines && lines.length > 0) {
      await this.adjustmentRepository.update(id, {
        ...updateData,
        lines: {
          deleteMany: {},
          create: lines
            .filter((l) => l.productId && l.quantityDelta != null)
            .map((l) => ({
              productId: l.productId!,
              quantityDelta: l.quantityDelta!,
              unitCost: l.unitCost != null ? new Decimal(l.unitCost) : undefined,
              notes: l.notes,
            })),
        },
      });
    } else {
      await this.adjustmentRepository.update(id, updateData);
    }

    const updated = await this.adjustmentRepository.findById(id);
    if (
      statusUpdate === AdjustmentStatus.COMPLETED &&
      updated?.status === AdjustmentStatus.COMPLETED
    ) {
      await this.applyAdjustment(id, currentUser);
    }

    const fresh = await this.adjustmentRepository.findById(id);
    return new AdjustmentResponseDto(fresh ?? updated!);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.adjustmentRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Adjustment not found');
    }
    if (existing.status === AdjustmentStatus.COMPLETED) {
      throw new BadRequestException('Cannot delete a completed adjustment');
    }
    await this.adjustmentRepository.delete(id);
  }

  private async applyAdjustment(
    adjustmentId: string,
    currentUser?: UserResponseDto,
  ): Promise<void> {
    const adjustment = await this.adjustmentRepository.findById(adjustmentId);
    if (!adjustment || adjustment.status !== AdjustmentStatus.COMPLETED) return;

    const storeId = adjustment.storeId;
    const reason = adjustment.reason ?? 'Inventory adjustment';

    const lines = (adjustment as { lines?: { productId: string; quantityDelta: number; product?: { name?: string }; unitCost?: unknown }[] }).lines ?? [];
    for (const line of lines) {
      const productId = line.productId;
      const quantityDelta = line.quantityDelta;
      if (quantityDelta === 0) continue;

      let inventory = await this.inventoryRepository.findByProductAndStore(
        productId,
        storeId,
      );
      if (!inventory) {
        inventory = await this.inventoryRepository.create({
          product: { connect: { id: productId } },
          store: { connect: { id: storeId } },
          quantity: 0,
          reservedQuantity: 0,
          availableQuantity: 0,
          ...(currentUser?.id ? { updatedBy: currentUser.id } : {}),
        });
      }

      const newQuantity = inventory.quantity + quantityDelta;
      if (newQuantity < 0) {
        throw new BadRequestException(
          `Insufficient stock for product ${line.product?.name ?? productId}`,
        );
      }
      const newAvailable = newQuantity - inventory.reservedQuantity;

      await this.inventoryRepository.update(inventory.id, {
        quantity: newQuantity,
        availableQuantity: newAvailable,
        lastUpdated: new Date(),
        ...(currentUser?.id ? { updatedBy: currentUser.id } : {}),
      });

      const unitCostVal = line.unitCost != null ? Number(line.unitCost) : undefined;
      const unitCost = unitCostVal !== undefined && !Number.isNaN(unitCostVal) ? new Decimal(unitCostVal) : undefined;
      await this.inventoryRepository.createMovement({
        inventory: { connect: { id: inventory.id } },
        movementType: InventoryMovementType.ADJUSTMENT,
        quantity: quantityDelta,
        reference: adjustment.adjustmentNumber,
        referenceId: adjustmentId,
        reason,
        unitCost,
        totalCost: unitCost != null ? new Decimal(unitCostVal! * Math.abs(quantityDelta)) : undefined,
        ...(currentUser?.id ? { createdBy: currentUser.id } : {}),
      });
    }
  }
}
