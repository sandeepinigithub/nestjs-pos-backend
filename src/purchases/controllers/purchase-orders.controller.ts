import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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
import { PurchaseOrdersService } from '../services/purchase-orders.service';
import { PurchaseDashboardService } from '../services/purchase-dashboard.service';
import { CreatePurchaseOrderDto } from '../dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from '../dto/update-purchase-order.dto';
import { PurchaseOrderResponseDto } from '../dto/purchase-order-response.dto';
import { ListPurchaseOrdersQueryDto } from '../dto/list-purchase-orders-query.dto';
import { PaginationResponseDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { UserResponseDto } from '../../users/dto/user-response.dto';

@ApiTags('Purchases')
@Controller('purchases/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PurchaseOrdersController {
  constructor(
    private readonly purchaseOrdersService: PurchaseOrdersService,
    private readonly purchaseDashboardService: PurchaseDashboardService,
  ) {}

  @Get('open')
  @Roles(
    UserRole.PURCHASE_MANAGER,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'Get open purchase orders' })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiResponse({ status: 200, description: 'Open purchase orders' })
  async getOpenPurchaseOrders(
    @Query('storeId') storeId?: string,
    @CurrentUser() currentUser?: UserResponseDto,
  ) {
    const effectiveTenantId =
      currentUser?.role === UserRole.SUPER_ADMIN ? undefined : currentUser?.tenantId;
    return this.purchaseDashboardService.getOpenPurchaseOrders(storeId, effectiveTenantId);
  }

  @Get('pending-approval')
  @Roles(
    UserRole.PURCHASE_MANAGER,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'Get pending approval purchase orders' })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiResponse({ status: 200, description: 'Pending approvals' })
  async getPendingApprovals(
    @Query('storeId') storeId?: string,
    @CurrentUser() currentUser?: UserResponseDto,
  ) {
    const effectiveTenantId =
      currentUser?.role === UserRole.SUPER_ADMIN ? undefined : currentUser?.tenantId;
    return this.purchaseDashboardService.getPendingApprovals(storeId, effectiveTenantId);
  }

  @Get()
  @Roles(
    UserRole.PURCHASE_MANAGER,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'List purchase orders' })
  @ApiResponse({ status: 200, description: 'Purchase orders list', type: PaginationResponseDto })
  async findAll(
    @Query() query: ListPurchaseOrdersQueryDto,
    @CurrentUser() currentUser?: UserResponseDto,
  ): Promise<PaginationResponseDto<PurchaseOrderResponseDto>> {
    return this.purchaseOrdersService.findAll(query, currentUser);
  }

  @Get(':id')
  @Roles(
    UserRole.PURCHASE_MANAGER,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'Get purchase order by id' })
  @ApiResponse({ status: 200, description: 'Purchase order details', type: PurchaseOrderResponseDto })
  async findOne(@Param('id') id: string): Promise<PurchaseOrderResponseDto> {
    return this.purchaseOrdersService.findOne(id);
  }

  @Post()
  @Roles(
    UserRole.PURCHASE_MANAGER,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'Create purchase order' })
  @ApiResponse({ status: 201, description: 'Purchase order created', type: PurchaseOrderResponseDto })
  async create(
    @Body() dto: CreatePurchaseOrderDto,
    @CurrentUser() currentUser?: UserResponseDto,
  ): Promise<PurchaseOrderResponseDto> {
    return this.purchaseOrdersService.create(dto, currentUser);
  }

  @Put(':id')
  @Roles(
    UserRole.PURCHASE_MANAGER,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'Update purchase order' })
  @ApiResponse({ status: 200, description: 'Purchase order updated', type: PurchaseOrderResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePurchaseOrderDto,
    @CurrentUser() currentUser?: UserResponseDto,
  ): Promise<PurchaseOrderResponseDto> {
    return this.purchaseOrdersService.update(id, dto, currentUser);
  }

  @Delete(':id')
  @Roles(
    UserRole.PURCHASE_MANAGER,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'Delete purchase order' })
  @ApiResponse({ status: 200, description: 'Purchase order deleted' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.purchaseOrdersService.remove(id);
  }
}
