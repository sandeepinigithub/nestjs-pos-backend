import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InventoryRepository } from '../repositories/inventory.repository';
import { InventoryResponseDto } from '../dto/inventory-response.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { PaginationDto, PaginationResponseDto } from '../../common/dto/pagination.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { InventoryMovementType } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(
    private inventoryRepository: InventoryRepository,
    private prisma: PrismaService,
  ) {}

  async findByStore(storeId: string, paginationDto: PaginationDto): Promise<PaginationResponseDto<InventoryResponseDto>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [inventory, total] = await Promise.all([
      this.inventoryRepository.findMany({
        where: { storeId },
        skip,
        take: limit,
        orderBy: { lastUpdated: 'desc' },
        include: {
          product: true,
        },
      }),
      this.inventoryRepository.count({ storeId }),
    ]);

    return {
      data: inventory.map((inv) => new InventoryResponseDto(inv)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(productId: string, storeId: string): Promise<InventoryResponseDto> {
    const inventory = await this.inventoryRepository.findByProductAndStore(productId, storeId);
    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    return new InventoryResponseDto(inventory);
  }

  async adjustStock(
    productId: string,
    storeId: string,
    quantity: number,
    movementType: InventoryMovementType,
    reason?: string,
    currentUser?: UserResponseDto,
  ): Promise<InventoryResponseDto> {
    let inventory = await this.inventoryRepository.findByProductAndStore(productId, storeId);

    if (!inventory) {
      // Create inventory if it doesn't exist
      inventory = await this.inventoryRepository.create({
        product: { connect: { id: productId } },
        store: { connect: { id: storeId } },
        quantity: 0,
        reservedQuantity: 0,
        availableQuantity: 0,
        ...(currentUser?.id ? { updatedBy: currentUser.id } : {}),
      });
    }

    // Calculate new quantity
    const newQuantity =
      movementType === InventoryMovementType.IN || movementType === InventoryMovementType.RETURN
        ? inventory.quantity + quantity
        : inventory.quantity - quantity;

    if (newQuantity < 0) {
      throw new BadRequestException('Insufficient stock');
    }

    const newAvailableQuantity = newQuantity - inventory.reservedQuantity;

    // Update inventory
    inventory = await this.inventoryRepository.update(inventory.id, {
      quantity: newQuantity,
      availableQuantity: newAvailableQuantity,
      lastUpdated: new Date(),
      ...(currentUser?.id ? { updatedBy: currentUser.id } : {}),
    });

    // Create movement record
    await this.inventoryRepository.createMovement({
      inventory: { connect: { id: inventory.id } },
      movementType,
      quantity: movementType === InventoryMovementType.IN || movementType === InventoryMovementType.RETURN ? quantity : -quantity,
      reason,
      ...(currentUser?.id ? { createdBy: currentUser.id } : {}),
    });

    return new InventoryResponseDto(inventory);
  }

  async getMovements(inventoryId: string, paginationDto: PaginationDto): Promise<any> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const movements = await this.inventoryRepository.getMovements(inventoryId, { skip, take: limit });
    return movements;
  }
}

