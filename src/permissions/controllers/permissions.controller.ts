import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsService } from '../services/permissions.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { PermissionResponseDto } from '../dto/permission-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Permissions')
@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({ status: 201, description: 'Permission created successfully', type: PermissionResponseDto })
  async create(@Body() createPermissionDto: CreatePermissionDto): Promise<PermissionResponseDto> {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({ status: 200, description: 'Permissions retrieved successfully', type: [PermissionResponseDto] })
  async findAll(): Promise<PermissionResponseDto[]> {
    return this.permissionsService.findAll();
  }

  @Get('module/:module')
  @ApiOperation({ summary: 'Get permissions by module' })
  @ApiResponse({ status: 200, description: 'Permissions retrieved', type: [PermissionResponseDto] })
  async findByModule(@Param('module') module: string): Promise<PermissionResponseDto[]> {
    return this.permissionsService.findByModule(module);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a permission by ID' })
  @ApiResponse({ status: 200, description: 'Permission retrieved successfully', type: PermissionResponseDto })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async findOne(@Param('id') id: string): Promise<PermissionResponseDto> {
    return this.permissionsService.findOne(id);
  }
}

