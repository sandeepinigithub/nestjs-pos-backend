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
import { SalesDashboardService } from '../services/sales-dashboard.service';
import { PosOperationsService } from '../services/pos-operations.service';
import {
  SalesDashboardResponseDto,
} from '../dto/sales-dashboard.dto';
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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { UserResponseDto } from '../../users/dto/user-response.dto';

@ApiTags('Sales')
@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SalesController {
  constructor(
    private readonly salesDashboardService: SalesDashboardService,
    private readonly posOperationsService: PosOperationsService,
  ) {}

  // Dashboard APIs
  @Get('dashboard')
  @Roles(
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.CASHIER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'Get sales dashboard metrics' })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiQuery({ name: 'period', required: false, enum: ['DAILY', 'WEEKLY', 'MONTHLY'] })
  @ApiQuery({ name: 'tenantId', required: false })
  @ApiResponse({
    status: 200,
    description: 'Sales dashboard retrieved successfully',
    type: SalesDashboardResponseDto,
  })
  async getDashboard(
    @Query('storeId') storeId?: string,
    @Query('period') period?: 'DAILY' | 'WEEKLY' | 'MONTHLY',
    @Query('tenantId') tenantId?: string,
    @CurrentUser() currentUser?: UserResponseDto,
  ): Promise<SalesDashboardResponseDto> {
    const effectiveTenantId =
      currentUser?.role === UserRole.SUPER_ADMIN ? tenantId : currentUser?.tenantId;

    return this.salesDashboardService.getDashboard(
      effectiveTenantId,
      storeId,
      period || 'MONTHLY',
    );
  }

  @Get('metrics')
  @Roles(
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'Get sales metrics' })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiQuery({ name: 'period', required: false, enum: ['DAILY', 'WEEKLY', 'MONTHLY'] })
  @ApiResponse({
    status: 200,
    description: 'Sales metrics retrieved successfully',
  })
  async getMetrics(
    @Query('storeId') storeId?: string,
    @Query('period') period?: 'DAILY' | 'WEEKLY' | 'MONTHLY',
    @CurrentUser() currentUser?: UserResponseDto,
  ) {
    const effectiveTenantId =
      currentUser?.role === UserRole.SUPER_ADMIN ? undefined : currentUser?.tenantId;
    const now = new Date();
    const { startDate, endDate } = this.salesDashboardService.getDateRange(
      period || 'MONTHLY',
      now,
    );

    return this.salesDashboardService.getAnalytics(startDate, endDate, storeId, effectiveTenantId);
  }

  @Get('recent-activity')
  @Roles(
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.CASHIER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'Get recent sales activity' })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Recent activity retrieved successfully',
  })
  async getRecentActivity(
    @Query('storeId') storeId?: string,
    @Query('limit') limit?: number,
    @CurrentUser() currentUser?: UserResponseDto,
  ) {
    const effectiveTenantId =
      currentUser?.role === UserRole.SUPER_ADMIN ? undefined : currentUser?.tenantId;

    return this.salesDashboardService.getRecentActivity(
      storeId,
      effectiveTenantId,
      limit || 20,
    );
  }

  // POS Operations APIs
  @Post('orders/:id/hold')
  @Roles(UserRole.CASHIER, UserRole.STORE_MANAGER, UserRole.STORE_ADMIN)
  @ApiOperation({ summary: 'Hold an order' })
  @ApiResponse({
    status: 200,
    description: 'Order held successfully',
    type: OrderResponseDto,
  })
  async holdOrder(
    @Param('id') orderId: string,
    @Body() holdOrderDto: HoldOrderDto,
    @CurrentUser() currentUser: UserResponseDto,
  ): Promise<OrderResponseDto> {
    return this.posOperationsService.holdOrder(orderId, holdOrderDto, currentUser);
  }

  @Post('orders/:id/resume')
  @Roles(UserRole.CASHIER, UserRole.STORE_MANAGER, UserRole.STORE_ADMIN)
  @ApiOperation({ summary: 'Resume a held order' })
  @ApiResponse({
    status: 200,
    description: 'Order resumed successfully',
    type: OrderResponseDto,
  })
  async resumeOrder(
    @Param('id') orderId: string,
    @Body() resumeOrderDto: ResumeOrderDto,
    @CurrentUser() currentUser: UserResponseDto,
  ): Promise<OrderResponseDto> {
    return this.posOperationsService.resumeOrder(orderId, resumeOrderDto, currentUser);
  }

  @Post('orders/:id/cancel')
  @Roles(UserRole.CASHIER, UserRole.STORE_MANAGER, UserRole.STORE_ADMIN)
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiResponse({
    status: 200,
    description: 'Order cancelled successfully',
    type: OrderResponseDto,
  })
  async cancelOrder(
    @Param('id') orderId: string,
    @Body() cancelOrderDto: CancelOrderDto,
    @CurrentUser() currentUser: UserResponseDto,
  ): Promise<OrderResponseDto> {
    return this.posOperationsService.cancelOrder(orderId, cancelOrderDto, currentUser);
  }

  @Post('orders/:id/payments')
  @Roles(UserRole.CASHIER, UserRole.STORE_MANAGER, UserRole.STORE_ADMIN)
  @ApiOperation({ summary: 'Process payment for an order' })
  @ApiResponse({
    status: 200,
    description: 'Payment processed successfully',
  })
  async processPayment(
    @Param('id') orderId: string,
    @Body() processPaymentDto: ProcessPaymentDto,
    @CurrentUser() currentUser: UserResponseDto,
  ) {
    return this.posOperationsService.processPayment(orderId, processPaymentDto, currentUser);
  }

  @Post('orders/:id/void-payment')
  @Roles(UserRole.CASHIER, UserRole.STORE_MANAGER, UserRole.STORE_ADMIN)
  @ApiOperation({ summary: 'Void a payment' })
  @ApiResponse({
    status: 200,
    description: 'Payment voided successfully',
  })
  async voidPayment(
    @Param('id') orderId: string,
    @Body() voidPaymentDto: VoidPaymentDto,
    @CurrentUser() currentUser: UserResponseDto,
  ) {
    return this.posOperationsService.voidPayment(orderId, voidPaymentDto, currentUser);
  }

  @Post('orders/:id/kot')
  @Roles(UserRole.CASHIER, UserRole.STORE_MANAGER, UserRole.STORE_ADMIN)
  @ApiOperation({ summary: 'Generate KOT (Kitchen Order Ticket)' })
  @ApiResponse({
    status: 200,
    description: 'KOT generated successfully',
  })
  async createKOT(
    @Param('id') orderId: string,
    @Body() createKOTDto: CreateKOTDto,
    @CurrentUser() currentUser: UserResponseDto,
  ) {
    return this.posOperationsService.createKOT(orderId, createKOTDto, currentUser);
  }

  @Post('orders/:id/tasting')
  @Roles(UserRole.CASHIER, UserRole.STORE_MANAGER, UserRole.STORE_ADMIN)
  @ApiOperation({ summary: 'Track tasting chocolates to customer' })
  @ApiResponse({
    status: 200,
    description: 'Tasting tracked successfully',
  })
  async trackTasting(
    @Param('id') orderId: string,
    @Body() trackTastingDto: TrackTastingDto,
    @CurrentUser() currentUser: UserResponseDto,
  ) {
    return this.posOperationsService.trackTasting(orderId, trackTastingDto, currentUser);
  }
}
