import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditService } from '../services/audit.service';
import { PaginationDto, PaginationResponseDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Audit')
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.SYSTEM_AUDITOR)
  @ApiOperation({ summary: 'Get audit logs with pagination' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'resource', required: false })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
    type: PaginationResponseDto,
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query('userId') userId?: string,
    @Query('storeId') storeId?: string,
    @Query('action') action?: string,
    @Query('resource') resource?: string,
  ): Promise<PaginationResponseDto<any>> {
    return this.auditService.findAll(paginationDto, { userId, storeId, action, resource });
  }

  @Get('user/:userId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.SYSTEM_AUDITOR)
  @ApiOperation({ summary: 'Get audit logs by user' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved',
    type: PaginationResponseDto,
  })
  async findByUser(
    @Param('userId') userId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginationResponseDto<any>> {
    return this.auditService.findByUser(userId, paginationDto);
  }

  @Get('resource/:resource/:resourceId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.SYSTEM_AUDITOR)
  @ApiOperation({ summary: 'Get audit logs for a specific resource' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved', type: Array })
  async findByResource(
    @Param('resource') resource: string,
    @Param('resourceId') resourceId: string,
  ): Promise<any[]> {
    return this.auditService.findByResource(resource, resourceId);
  }
}

