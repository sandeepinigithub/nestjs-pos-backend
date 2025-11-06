import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CustomersService } from '../services/customers.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { CustomerResponseDto } from '../dto/customer-response.dto';
import { PaginationDto, PaginationResponseDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Customers')
@Controller('customers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({ status: 201, description: 'Customer created successfully', type: CustomerResponseDto })
  async create(@Body() createCustomerDto: CreateCustomerDto): Promise<CustomerResponseDto> {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers with pagination' })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({
    status: 200,
    description: 'Customers retrieved successfully',
    type: PaginationResponseDto,
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query('search') search?: string,
  ): Promise<PaginationResponseDto<CustomerResponseDto>> {
    return this.customersService.findAll(paginationDto, { search });
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Find customer by email' })
  @ApiResponse({ status: 200, description: 'Customer found', type: CustomerResponseDto })
  async findByEmail(@Param('email') email: string): Promise<CustomerResponseDto | null> {
    return this.customersService.findByEmail(email);
  }

  @Get('phone/:phone')
  @ApiOperation({ summary: 'Find customer by phone' })
  @ApiResponse({ status: 200, description: 'Customer found', type: CustomerResponseDto })
  async findByPhone(@Param('phone') phone: string): Promise<CustomerResponseDto | null> {
    return this.customersService.findByPhone(phone);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a customer by ID' })
  @ApiResponse({ status: 200, description: 'Customer retrieved successfully', type: CustomerResponseDto })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async findOne(@Param('id') id: string): Promise<CustomerResponseDto> {
    return this.customersService.findOne(id);
  }
}

