import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderResponseDto } from '../dto/order-response.dto';
import { PaginationDto, PaginationResponseDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserResponseDto } from '../../users/dto/user-response.dto';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully', type: OrderResponseDto })
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() currentUser: UserResponseDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.create(createOrderDto, currentUser);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders with pagination' })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
    type: PaginationResponseDto,
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query('storeId') storeId?: string,
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
  ): Promise<PaginationResponseDto<OrderResponseDto>> {
    return this.ordersService.findAll(paginationDto, { storeId, status, customerId });
  }

  @Get('store/:storeId')
  @ApiOperation({ summary: 'Get orders by store' })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
    type: PaginationResponseDto,
  })
  async findByStore(
    @Param('storeId') storeId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginationResponseDto<OrderResponseDto>> {
    return this.ordersService.findByStore(storeId, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully', type: OrderResponseDto })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(@Param('id') id: string): Promise<OrderResponseDto> {
    return this.ordersService.findOne(id);
  }
}

