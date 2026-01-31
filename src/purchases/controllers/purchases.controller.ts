import {
  Controller,
  Get,
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
import { PurchaseDashboardService } from '../services/purchase-dashboard.service';
import { PurchaseDashboardResponseDto } from '../dto/purchase-dashboard.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { UserResponseDto } from '../../users/dto/user-response.dto';

@ApiTags('Purchases')
@Controller('purchases')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PurchasesController {
  constructor(private readonly purchaseDashboardService: PurchaseDashboardService) {}

  @Get('dashboard')
  @Roles(
    UserRole.PURCHASE_MANAGER,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'Get purchase dashboard metrics' })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiQuery({ name: 'period', required: false, enum: ['DAILY', 'WEEKLY', 'MONTHLY'] })
  @ApiQuery({ name: 'tenantId', required: false })
  @ApiResponse({
    status: 200,
    description: 'Purchase dashboard retrieved successfully',
    type: PurchaseDashboardResponseDto,
  })
  async getDashboard(
    @Query('storeId') storeId?: string,
    @Query('period') period?: 'DAILY' | 'WEEKLY' | 'MONTHLY',
    @Query('tenantId') tenantId?: string,
    @CurrentUser() currentUser?: UserResponseDto,
  ): Promise<PurchaseDashboardResponseDto> {
    const effectiveTenantId =
      currentUser?.role === UserRole.SUPER_ADMIN ? tenantId : currentUser?.tenantId;

    return this.purchaseDashboardService.getDashboard(
      effectiveTenantId,
      storeId,
      period || 'MONTHLY',
    );
  }

  @Get('summary')
  @Roles(
    UserRole.PURCHASE_MANAGER,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'Get purchase summary (daily / weekly / monthly)' })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiQuery({ name: 'period', required: false, enum: ['DAILY', 'WEEKLY', 'MONTHLY'] })
  @ApiResponse({
    status: 200,
    description: 'Purchase summary retrieved successfully',
  })
  async getPurchaseSummary(
    @Query('storeId') storeId?: string,
    @Query('period') period?: 'DAILY' | 'WEEKLY' | 'MONTHLY',
    @CurrentUser() currentUser?: UserResponseDto,
  ) {
    const now = new Date();
    const { startDate, endDate } = this.purchaseDashboardService.getDateRange(
      period || 'MONTHLY',
      now,
    );
    const effectiveTenantId =
      currentUser?.role === UserRole.SUPER_ADMIN ? undefined : currentUser?.tenantId;

    return this.purchaseDashboardService.getPurchaseSummary(
      startDate,
      endDate,
      storeId,
      effectiveTenantId,
    );
  }

  @Get('orders/open')
  @Roles(
    UserRole.PURCHASE_MANAGER,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'Get open purchase orders' })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiResponse({
    status: 200,
    description: 'Open purchase orders retrieved successfully',
  })
  async getOpenPurchaseOrders(
    @Query('storeId') storeId?: string,
    @CurrentUser() currentUser?: UserResponseDto,
  ) {
    const effectiveTenantId =
      currentUser?.role === UserRole.SUPER_ADMIN ? undefined : currentUser?.tenantId;

    return this.purchaseDashboardService.getOpenPurchaseOrders(storeId, effectiveTenantId);
  }

  @Get('orders/pending-approval')
  @Roles(
    UserRole.PURCHASE_MANAGER,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'Get pending approval purchase orders' })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiResponse({
    status: 200,
    description: 'Pending approvals retrieved successfully',
  })
  async getPendingApprovals(
    @Query('storeId') storeId?: string,
    @CurrentUser() currentUser?: UserResponseDto,
  ) {
    const effectiveTenantId =
      currentUser?.role === UserRole.SUPER_ADMIN ? undefined : currentUser?.tenantId;

    return this.purchaseDashboardService.getPendingApprovals(storeId, effectiveTenantId);
  }

  @Get('supplier-analysis')
  @Roles(
    UserRole.PURCHASE_MANAGER,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'Get supplier-wise purchase value' })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiQuery({ name: 'period', required: false, enum: ['DAILY', 'WEEKLY', 'MONTHLY'] })
  @ApiResponse({
    status: 200,
    description: 'Supplier-wise purchases retrieved successfully',
  })
  async getSupplierWisePurchases(
    @Query('storeId') storeId?: string,
    @Query('period') period?: 'DAILY' | 'WEEKLY' | 'MONTHLY',
    @CurrentUser() currentUser?: UserResponseDto,
  ) {
    const now = new Date();
    const { startDate, endDate } = this.purchaseDashboardService.getDateRange(
      period || 'MONTHLY',
      now,
    );
    const effectiveTenantId =
      currentUser?.role === UserRole.SUPER_ADMIN ? undefined : currentUser?.tenantId;

    return this.purchaseDashboardService.getSupplierWisePurchases(
      startDate,
      endDate,
      storeId,
      effectiveTenantId,
    );
  }

  @Get('category-analysis')
  @Roles(
    UserRole.PURCHASE_MANAGER,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'Get category-wise procurement' })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiQuery({ name: 'period', required: false, enum: ['DAILY', 'WEEKLY', 'MONTHLY'] })
  @ApiResponse({
    status: 200,
    description: 'Category-wise procurement retrieved successfully',
  })
  async getCategoryWiseProcurement(
    @Query('storeId') storeId?: string,
    @Query('period') period?: 'DAILY' | 'WEEKLY' | 'MONTHLY',
    @CurrentUser() currentUser?: UserResponseDto,
  ) {
    const now = new Date();
    const { startDate, endDate } = this.purchaseDashboardService.getDateRange(
      period || 'MONTHLY',
      now,
    );
    const effectiveTenantId =
      currentUser?.role === UserRole.SUPER_ADMIN ? undefined : currentUser?.tenantId;

    return this.purchaseDashboardService.getCategoryWiseProcurement(
      startDate,
      endDate,
      storeId,
      effectiveTenantId,
    );
  }

  @Get('delivery-status')
  @Roles(
    UserRole.PURCHASE_MANAGER,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'Get delivery status (received / pending / delayed)' })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiResponse({
    status: 200,
    description: 'Delivery status retrieved successfully',
  })
  async getDeliveryStatus(
    @Query('storeId') storeId?: string,
    @CurrentUser() currentUser?: UserResponseDto,
  ) {
    const effectiveTenantId =
      currentUser?.role === UserRole.SUPER_ADMIN ? undefined : currentUser?.tenantId;

    return this.purchaseDashboardService.getDeliveryStatus(storeId, effectiveTenantId);
  }

  @Get('trend')
  @Roles(
    UserRole.PURCHASE_MANAGER,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'Get purchase vs sales trend' })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiQuery({ name: 'period', required: false, enum: ['DAILY', 'WEEKLY', 'MONTHLY'] })
  @ApiResponse({
    status: 200,
    description: 'Purchase vs sales trend retrieved successfully',
  })
  async getPurchaseVsSalesTrend(
    @Query('storeId') storeId?: string,
    @Query('period') period?: 'DAILY' | 'WEEKLY' | 'MONTHLY',
    @CurrentUser() currentUser?: UserResponseDto,
  ) {
    const now = new Date();
    const { startDate, endDate } = this.purchaseDashboardService.getDateRange(
      period || 'MONTHLY',
      now,
    );
    const effectiveTenantId =
      currentUser?.role === UserRole.SUPER_ADMIN ? undefined : currentUser?.tenantId;

    return this.purchaseDashboardService.getPurchaseVsSalesTrend(
      startDate,
      endDate,
      storeId,
      effectiveTenantId,
    );
  }

  @Get('tax-discount-summary')
  @Roles(
    UserRole.PURCHASE_MANAGER,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.ACCOUNTANT,
  )
  @ApiOperation({ summary: 'Get tax & discount summary (read-only)' })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiQuery({ name: 'period', required: false, enum: ['DAILY', 'WEEKLY', 'MONTHLY'] })
  @ApiResponse({
    status: 200,
    description: 'Tax & discount summary retrieved successfully',
  })
  async getTaxDiscountSummary(
    @Query('storeId') storeId?: string,
    @Query('period') period?: 'DAILY' | 'WEEKLY' | 'MONTHLY',
    @CurrentUser() currentUser?: UserResponseDto,
  ) {
    const now = new Date();
    const { startDate, endDate } = this.purchaseDashboardService.getDateRange(
      period || 'MONTHLY',
      now,
    );
    const effectiveTenantId =
      currentUser?.role === UserRole.SUPER_ADMIN ? undefined : currentUser?.tenantId;

    return this.purchaseDashboardService.getTaxDiscountSummary(
      startDate,
      endDate,
      storeId,
      effectiveTenantId,
    );
  }

  @Get('grn-status')
  @Roles(
    UserRole.PURCHASE_MANAGER,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'Get GRN (Goods Receipt Note) status' })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiResponse({
    status: 200,
    description: 'GRN status retrieved successfully',
  })
  async getGRNStatus(
    @Query('storeId') storeId?: string,
    @CurrentUser() currentUser?: UserResponseDto,
  ) {
    const effectiveTenantId =
      currentUser?.role === UserRole.SUPER_ADMIN ? undefined : currentUser?.tenantId;

    return this.purchaseDashboardService.getGRNStatus(storeId, effectiveTenantId);
  }
}
