import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { InventoryService } from '../services/inventory.service';
import { InventoryDashboardService } from '../services/inventory-dashboard.service';
import { InventoryResponseDto } from '../dto/inventory-response.dto';
import {
  InventoryDashboardResponseDto,
  StockOnHandDto,
} from '../dto/inventory-dashboard.dto';
import { PaginationDto, PaginationResponseDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { UserRole } from '@prisma/client';
import { InventoryMovementType } from '@prisma/client';

@ApiTags('Inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly inventoryDashboardService: InventoryDashboardService,
  ) {}

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
  @Roles(UserRole.INVENTORY_MANAGER, UserRole.STORE_ADMIN, UserRole.STORE_MANAGER)
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

  // Dashboard APIs for Inventory Manager
  @Get('dashboard')
  @Roles(
    UserRole.INVENTORY_MANAGER,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'Get inventory dashboard metrics' })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'tenantId', required: false })
  @ApiResponse({
    status: 200,
    description: 'Inventory dashboard retrieved successfully',
    type: InventoryDashboardResponseDto,
  })
  async getDashboard(
    @Query('storeId') storeId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('tenantId') tenantId?: string,
    @CurrentUser() currentUser?: UserResponseDto,
  ): Promise<InventoryDashboardResponseDto> {
    // Apply tenant filtering if user is not super admin
    const effectiveTenantId =
      currentUser?.role === UserRole.SUPER_ADMIN ? tenantId : currentUser?.tenantId;

    return this.inventoryDashboardService.getDashboard(
      effectiveTenantId,
      storeId,
      categoryId,
    );
  }

  @Get('value')
  @Roles(
    UserRole.INVENTORY_MANAGER,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'Get total inventory value (store-wise or category-wise)' })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiResponse({
    status: 200,
    description: 'Inventory value retrieved successfully',
  })
  async getInventoryValue(
    @Query('storeId') storeId?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.inventoryDashboardService.getInventoryValue(storeId, categoryId);
  }

  @Get('stock-on-hand')
  @Roles(
    UserRole.INVENTORY_MANAGER,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'Get stock on hand (SKU, product, variant)' })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiQuery({ name: 'productId', required: false })
  @ApiQuery({ name: 'sku', required: false })
  @ApiResponse({
    status: 200,
    description: 'Stock on hand retrieved successfully',
    type: [StockOnHandDto],
  })
  async getStockOnHand(
    @Query('storeId') storeId?: string,
    @Query('productId') productId?: string,
    @Query('sku') sku?: string,
  ): Promise<StockOnHandDto[]> {
    return this.inventoryDashboardService.getStockOnHand(storeId, productId, sku);
  }

  @Get('alerts')
  @Roles(
    UserRole.INVENTORY_MANAGER,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'Get low stock and out-of-stock alerts' })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiResponse({
    status: 200,
    description: 'Stock alerts retrieved successfully',
  })
  async getStockAlerts(@Query('storeId') storeId?: string) {
    return this.inventoryDashboardService.getStockAlerts(storeId);
  }

  @Get('movement-analysis')
  @Roles(
    UserRole.INVENTORY_MANAGER,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'Get fast-moving vs slow-moving items analysis' })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days for analysis', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Movement analysis retrieved successfully',
  })
  async getMovementAnalysis(@Query('storeId') storeId?: string, @Query('days') days?: number) {
    // This would need to be updated to accept days parameter
    return this.inventoryDashboardService.getMovementAnalysis(storeId);
  }

  @Get('aging')
  @Roles(
    UserRole.INVENTORY_MANAGER,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'Get stock aging report (days in inventory)' })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiResponse({
    status: 200,
    description: 'Stock aging retrieved successfully',
  })
  async getStockAging(@Query('storeId') storeId?: string) {
    return this.inventoryDashboardService.getStockAging(storeId);
  }

  @Get('damaged-blocked')
  @Roles(
    UserRole.INVENTORY_MANAGER,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'Get damaged and blocked stock (read-only)' })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiResponse({
    status: 200,
    description: 'Damaged and blocked stock retrieved successfully',
  })
  async getDamagedBlockedStock(@Query('storeId') storeId?: string) {
    return this.inventoryDashboardService.getDamagedBlockedStock(storeId);
  }
}

