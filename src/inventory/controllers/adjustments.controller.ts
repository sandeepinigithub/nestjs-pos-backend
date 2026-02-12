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
import { AdjustmentsService } from '../services/adjustments.service';
import { CreateAdjustmentDto } from '../dto/create-adjustment.dto';
import { UpdateAdjustmentDto } from '../dto/update-adjustment.dto';
import { AdjustmentResponseDto } from '../dto/adjustment-response.dto';
import { ListAdjustmentsQueryDto } from '../dto/list-adjustments-query.dto';
import { PaginationResponseDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { UserRole } from '@prisma/client';

@ApiTags('Inventory')
@Controller('inventory/adjustments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdjustmentsController {
  constructor(private readonly adjustmentsService: AdjustmentsService) {}

  @Get()
  @Roles(
    UserRole.INVENTORY_MANAGER,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'List inventory adjustments' })
  @ApiResponse({
    status: 200,
    description: 'Adjustments list',
    type: PaginationResponseDto,
  })
  async findAll(
    @Query() query: ListAdjustmentsQueryDto,
    @CurrentUser() currentUser?: UserResponseDto,
  ): Promise<PaginationResponseDto<AdjustmentResponseDto>> {
    return this.adjustmentsService.findAll(query, currentUser);
  }

  @Get(':id')
  @Roles(
    UserRole.INVENTORY_MANAGER,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'Get adjustment by id' })
  @ApiResponse({
    status: 200,
    description: 'Adjustment details',
    type: AdjustmentResponseDto,
  })
  async findOne(
    @Param('id') id: string,
  ): Promise<AdjustmentResponseDto> {
    return this.adjustmentsService.findOne(id);
  }

  @Post()
  @Roles(
    UserRole.INVENTORY_MANAGER,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'Create inventory adjustment' })
  @ApiResponse({
    status: 201,
    description: 'Adjustment created',
    type: AdjustmentResponseDto,
  })
  async create(
    @Body() dto: CreateAdjustmentDto,
    @CurrentUser() currentUser?: UserResponseDto,
  ): Promise<AdjustmentResponseDto> {
    return this.adjustmentsService.create(dto, currentUser);
  }

  @Put(':id')
  @Roles(
    UserRole.INVENTORY_MANAGER,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'Update inventory adjustment' })
  @ApiResponse({
    status: 200,
    description: 'Adjustment updated',
    type: AdjustmentResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAdjustmentDto,
    @CurrentUser() currentUser?: UserResponseDto,
  ): Promise<AdjustmentResponseDto> {
    return this.adjustmentsService.update(id, dto, currentUser);
  }

  @Delete(':id')
  @Roles(
    UserRole.INVENTORY_MANAGER,
    UserRole.STORE_ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
  )
  @ApiOperation({ summary: 'Delete inventory adjustment' })
  @ApiResponse({ status: 200, description: 'Adjustment deleted' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.adjustmentsService.remove(id);
  }
}
