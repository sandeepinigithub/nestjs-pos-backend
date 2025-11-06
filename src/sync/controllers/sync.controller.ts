import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SyncService } from '../services/sync.service';
import { PaginationDto, PaginationResponseDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { SyncDirection } from '@prisma/client';

@ApiTags('Sync')
@Controller('sync')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('initiate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Initiate a sync operation' })
  @ApiResponse({ status: 201, description: 'Sync initiated successfully' })
  async initiateSync(
    @Body() body: {
      storeId?: string;
      regionId?: string;
      syncType: string;
      direction: SyncDirection;
    },
  ): Promise<any> {
    return this.syncService.initiateSync(body);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get sync logs with pagination' })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiQuery({ name: 'regionId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiResponse({
    status: 200,
    description: 'Sync logs retrieved successfully',
    type: PaginationResponseDto,
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query('storeId') storeId?: string,
    @Query('regionId') regionId?: string,
    @Query('status') status?: string,
  ): Promise<PaginationResponseDto<any>> {
    return this.syncService.findAll(paginationDto, { storeId, regionId, status });
  }

  @Get('store/:storeId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get sync logs by store' })
  @ApiResponse({
    status: 200,
    description: 'Sync logs retrieved',
    type: PaginationResponseDto,
  })
  async findByStore(
    @Param('storeId') storeId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginationResponseDto<any>> {
    return this.syncService.findByStore(storeId, paginationDto);
  }
}

