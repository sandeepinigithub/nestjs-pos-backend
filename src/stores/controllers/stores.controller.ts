import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StoresService } from '../services/stores.service';
import { CreateStoreDto } from '../dto/create-store.dto';
import { StoreResponseDto } from '../dto/store-response.dto';
import { PaginationDto, PaginationResponseDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { UserResponseDto } from '../../users/dto/user-response.dto';

@ApiTags('Stores')
@Controller('stores')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new store' })
  @ApiResponse({ status: 201, description: 'Store created successfully', type: StoreResponseDto })
  async create(
    @Body() createStoreDto: CreateStoreDto,
    @CurrentUser() currentUser: UserResponseDto,
  ): Promise<StoreResponseDto> {
    return this.storesService.create(createStoreDto, currentUser);
  }

  @Get()
  @ApiOperation({ summary: 'Get all stores with pagination' })
  @ApiQuery({ name: 'storeType', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'regionId', required: false })
  @ApiResponse({
    status: 200,
    description: 'Stores retrieved successfully',
    type: PaginationResponseDto,
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query('storeType') storeType?: string,
    @Query('status') status?: string,
    @Query('regionId') regionId?: string,
  ): Promise<PaginationResponseDto<StoreResponseDto>> {
    return this.storesService.findAll(paginationDto, { storeType, status, regionId });
  }

  @Get('region/:regionId')
  @ApiOperation({ summary: 'Get stores by region' })
  @ApiResponse({ status: 200, description: 'Stores retrieved', type: [StoreResponseDto] })
  async findByRegion(@Param('regionId') regionId: string): Promise<StoreResponseDto[]> {
    return this.storesService.findByRegion(regionId);
  }

  @Get('type/:storeType')
  @ApiOperation({ summary: 'Get stores by type' })
  @ApiResponse({ status: 200, description: 'Stores retrieved', type: [StoreResponseDto] })
  async findByType(@Param('storeType') storeType: string): Promise<StoreResponseDto[]> {
    return this.storesService.findByType(storeType);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a store by ID' })
  @ApiResponse({ status: 200, description: 'Store retrieved successfully', type: StoreResponseDto })
  @ApiResponse({ status: 404, description: 'Store not found' })
  async findOne(@Param('id') id: string): Promise<StoreResponseDto> {
    return this.storesService.findOne(id);
  }

  @Get(':id/children')
  @ApiOperation({ summary: 'Get child stores' })
  @ApiResponse({ status: 200, description: 'Child stores retrieved', type: [StoreResponseDto] })
  async getChildren(@Param('id') id: string): Promise<StoreResponseDto[]> {
    return this.storesService.getChildren(id);
  }
}

