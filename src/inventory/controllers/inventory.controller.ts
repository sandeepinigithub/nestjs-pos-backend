import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from '../services/inventory.service';
import { InventoryResponseDto } from '../dto/inventory-response.dto';
import { PaginationDto, PaginationResponseDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { InventoryMovementType } from '@prisma/client';

@ApiTags('Inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('store/:storeId')
  @ApiOperation({ summary: 'Get inventory by store' })
  @ApiResponse({
    status: 200,
    description: 'Inventory retrieved successfully',
    type: PaginationResponseDto,
  })
  async findByStore(
    @Param('storeId') storeId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginationResponseDto<InventoryResponseDto>> {
    return this.inventoryService.findByStore(storeId, paginationDto);
  }

  @Get('product/:productId/store/:storeId')
  @ApiOperation({ summary: 'Get inventory for specific product at store' })
  @ApiResponse({ status: 200, description: 'Inventory retrieved', type: InventoryResponseDto })
  async findOne(
    @Param('productId') productId: string,
    @Param('storeId') storeId: string,
  ): Promise<InventoryResponseDto> {
    return this.inventoryService.findOne(productId, storeId);
  }

  @Post('adjust')
  @ApiOperation({ summary: 'Adjust inventory stock' })
  @ApiResponse({ status: 200, description: 'Inventory adjusted', type: InventoryResponseDto })
  async adjustStock(
    @Body() body: {
      productId: string;
      storeId: string;
      quantity: number;
      movementType: InventoryMovementType;
      reason?: string;
    },
    @CurrentUser() currentUser: UserResponseDto,
  ): Promise<InventoryResponseDto> {
    return this.inventoryService.adjustStock(
      body.productId,
      body.storeId,
      body.quantity,
      body.movementType,
      body.reason,
      currentUser,
    );
  }
}

