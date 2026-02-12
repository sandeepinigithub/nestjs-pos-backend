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
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PromotionsService } from '../services/promotions.service';
import { CreatePromotionDto } from '../dto/create-promotion.dto';
import { UpdatePromotionDto } from '../dto/update-promotion.dto';
import { PromotionResponseDto } from '../dto/promotion-response.dto';
import { ListPromotionsQueryDto } from '../dto/list-promotions-query.dto';
import { PaginationResponseDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { UserRole } from '@prisma/client';

@ApiTags('Promotions')
@Controller('promotions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get('metadata')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
  )
  @ApiOperation({ summary: 'Get metadata required by promotions UI (outlets, etc.)' })
  async getMetadata(
    @CurrentUser() currentUser: UserResponseDto,
  ): Promise<{ outlets: { id: string; name: string }[] }> {
    return this.promotionsService.getMetadata(currentUser);
  }

  @Post()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
  )
  @ApiOperation({ summary: 'Create a new promotion' })
  @ApiResponse({
    status: 201,
    description: 'Promotion created successfully',
    type: PromotionResponseDto,
  })
  async create(
    @Body() dto: CreatePromotionDto,
    @CurrentUser() currentUser: UserResponseDto,
  ): Promise<PromotionResponseDto> {
    return this.promotionsService.create(dto, currentUser);
  }

  @Get()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
  )
  @ApiOperation({ summary: 'List promotions with filters and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Promotions retrieved successfully',
    type: PaginationResponseDto,
  })
  async findAll(
    @Query() query: ListPromotionsQueryDto,
    @CurrentUser() currentUser?: UserResponseDto,
  ): Promise<PaginationResponseDto<PromotionResponseDto>> {
    const effectiveTenantId =
      currentUser?.role === UserRole.SUPER_ADMIN ? query.tenantId : currentUser?.tenantId;

    return this.promotionsService.findAll(
      { page: query.page, limit: query.limit },
      {
        tab: query.tab,
        search: query.search,
        from: query.from,
        to: query.to,
        outletId: query.outletId,
        tenantId: effectiveTenantId,
      },
    );
  }

  @Get(':id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
  )
  @ApiOperation({ summary: 'Get promotion by ID' })
  @ApiResponse({
    status: 200,
    description: 'Promotion retrieved successfully',
    type: PromotionResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<PromotionResponseDto> {
    return this.promotionsService.findOne(id);
  }

  @Put(':id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
  )
  @ApiOperation({ summary: 'Update promotion' })
  @ApiResponse({
    status: 200,
    description: 'Promotion updated successfully',
    type: PromotionResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePromotionDto,
  ): Promise<PromotionResponseDto> {
    return this.promotionsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.STORE_ADMIN,
  )
  @ApiOperation({ summary: 'Delete promotion' })
  @ApiResponse({ status: 200, description: 'Promotion deleted successfully' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.promotionsService.remove(id);
    return { message: 'Promotion deleted successfully' };
  }
}

