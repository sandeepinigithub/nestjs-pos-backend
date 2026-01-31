import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
import { BOGOService } from '../services/bogo.service';
import { CreateBOGODto } from '../dto/create-bogo.dto';
import { BOGOOfferResponseDto } from '../dto/bogo-response.dto';
import {
  ApplyBOGODto,
  EligibleBOGOResponseDto,
} from '../dto/apply-bogo.dto';
import { PaginationDto, PaginationResponseDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { UserResponseDto } from '../../users/dto/user-response.dto';

@ApiTags('BOGO Offers')
@Controller('bogo')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BOGOController {
  constructor(private readonly bogoService: BOGOService) {}

  @Post('offers')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
  )
  @ApiOperation({ summary: 'Create a new BOGO offer' })
  @ApiResponse({
    status: 201,
    description: 'BOGO offer created successfully',
    type: BOGOOfferResponseDto,
  })
  async create(
    @Body() createBOGODto: CreateBOGODto,
    @CurrentUser() currentUser: UserResponseDto,
  ): Promise<BOGOOfferResponseDto> {
    return this.bogoService.create(createBOGODto, currentUser);
  }

  @Get('offers')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.CASHIER,
  )
  @ApiOperation({ summary: 'Get all BOGO offers' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'tenantId', required: false })
  @ApiResponse({
    status: 200,
    description: 'BOGO offers retrieved successfully',
    type: PaginationResponseDto,
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('tenantId') tenantId?: string,
    @CurrentUser() currentUser?: UserResponseDto,
  ): Promise<PaginationResponseDto<BOGOOfferResponseDto>> {
    const effectiveTenantId =
      currentUser?.role === UserRole.SUPER_ADMIN ? tenantId : currentUser?.tenantId;

    return this.bogoService.findAll(paginationDto, { status, type, tenantId: effectiveTenantId });
  }

  @Get('offers/:id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.CASHIER,
  )
  @ApiOperation({ summary: 'Get a BOGO offer by ID' })
  @ApiResponse({
    status: 200,
    description: 'BOGO offer retrieved successfully',
    type: BOGOOfferResponseDto,
  })
  @ApiResponse({ status: 404, description: 'BOGO offer not found' })
  async findOne(@Param('id') id: string): Promise<BOGOOfferResponseDto> {
    return this.bogoService.findOne(id);
  }

  @Put('offers/:id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
  )
  @ApiOperation({ summary: 'Update a BOGO offer' })
  @ApiResponse({
    status: 200,
    description: 'BOGO offer updated successfully',
    type: BOGOOfferResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateBOGODto: Partial<CreateBOGODto>,
    @CurrentUser() currentUser: UserResponseDto,
  ): Promise<BOGOOfferResponseDto> {
    return this.bogoService.update(id, updateBOGODto, currentUser);
  }

  @Delete('offers/:id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.STORE_ADMIN,
  )
  @ApiOperation({ summary: 'Delete a BOGO offer' })
  @ApiResponse({ status: 200, description: 'BOGO offer deleted successfully' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.bogoService.remove(id);
    return { message: 'BOGO offer deleted successfully' };
  }

  @Get('eligible')
  @Roles(
    UserRole.CASHIER,
    UserRole.STORE_MANAGER,
    UserRole.STORE_ADMIN,
  )
  @ApiOperation({ summary: 'Get eligible BOGO offers for an order' })
  @ApiQuery({ name: 'orderId', required: true })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiQuery({ name: 'couponCode', required: false })
  @ApiResponse({
    status: 200,
    description: 'Eligible BOGO offers retrieved successfully',
    type: [EligibleBOGOResponseDto],
  })
  async getEligible(
    @Query('orderId') orderId: string,
    @Query('customerId') customerId?: string,
    @Query('couponCode') couponCode?: string,
  ): Promise<EligibleBOGOResponseDto[]> {
    return this.bogoService.getEligibleOffers(orderId, customerId, couponCode);
  }

  @Post('apply')
  @Roles(
    UserRole.CASHIER,
    UserRole.STORE_MANAGER,
    UserRole.STORE_ADMIN,
  )
  @ApiOperation({ summary: 'Apply BOGO offer to an order' })
  @ApiQuery({ name: 'orderId', required: true })
  @ApiResponse({
    status: 200,
    description: 'BOGO offer applied successfully',
  })
  async applyBOGO(
    @Query('orderId') orderId: string,
    @Body() applyBOGODto: ApplyBOGODto,
    @CurrentUser() currentUser: UserResponseDto,
  ) {
    return this.bogoService.applyBOGO(orderId, applyBOGODto, currentUser);
  }

  @Post('vouchers/redeem')
  @Roles(
    UserRole.CASHIER,
    UserRole.STORE_MANAGER,
    UserRole.STORE_ADMIN,
  )
  @ApiOperation({ summary: 'Redeem a BOGO voucher' })
  @ApiQuery({ name: 'orderId', required: true })
  @ApiQuery({ name: 'voucherCode', required: true })
  @ApiResponse({
    status: 200,
    description: 'Voucher redeemed successfully',
  })
  async redeemVoucher(
    @Query('orderId') orderId: string,
    @Query('voucherCode') voucherCode: string,
    @CurrentUser() currentUser: UserResponseDto,
  ) {
    return this.bogoService.redeemVoucher(voucherCode, orderId, currentUser);
  }

  @Get('vouchers/customer/:customerId')
  @Roles(
    UserRole.CASHIER,
    UserRole.STORE_MANAGER,
    UserRole.STORE_ADMIN,
    UserRole.USER,
  )
  @ApiOperation({ summary: 'Get customer vouchers' })
  @ApiResponse({
    status: 200,
    description: 'Customer vouchers retrieved successfully',
  })
  async getCustomerVouchers(@Param('customerId') customerId: string) {
    return this.bogoService.getCustomerVouchers(customerId);
  }
}
