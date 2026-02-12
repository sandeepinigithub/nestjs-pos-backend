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
} from '@nestjs/swagger';
import { VendorsService } from '../services/vendors.service';
import { CreateVendorDto } from '../dto/create-vendor.dto';
import { UpdateVendorDto } from '../dto/update-vendor.dto';
import { VendorResponseDto } from '../dto/vendor-response.dto';
import { ListVendorsQueryDto } from '../dto/list-vendors-query.dto';
import { PaginationResponseDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Purchases')
@Controller('purchases/vendors')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Get()
  @Roles(
    UserRole.PURCHASE_MANAGER,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'List vendors (suppliers)' })
  @ApiResponse({
    status: 200,
    description: 'Vendors list',
    type: PaginationResponseDto,
  })
  async findAll(
    @Query() query: ListVendorsQueryDto,
  ): Promise<PaginationResponseDto<VendorResponseDto>> {
    return this.vendorsService.findAll(query);
  }

  @Get(':id')
  @Roles(
    UserRole.PURCHASE_MANAGER,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'Get vendor by id' })
  @ApiResponse({
    status: 200,
    description: 'Vendor details',
    type: VendorResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<VendorResponseDto> {
    return this.vendorsService.findOne(id);
  }

  @Post()
  @Roles(
    UserRole.PURCHASE_MANAGER,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'Create vendor' })
  @ApiResponse({
    status: 201,
    description: 'Vendor created',
    type: VendorResponseDto,
  })
  async create(@Body() dto: CreateVendorDto): Promise<VendorResponseDto> {
    return this.vendorsService.create(dto);
  }

  @Put(':id')
  @Roles(
    UserRole.PURCHASE_MANAGER,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'Update vendor' })
  @ApiResponse({
    status: 200,
    description: 'Vendor updated',
    type: VendorResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateVendorDto,
  ): Promise<VendorResponseDto> {
    return this.vendorsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(
    UserRole.PURCHASE_MANAGER,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'Delete vendor' })
  @ApiResponse({ status: 200, description: 'Vendor deleted' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.vendorsService.remove(id);
  }
}
