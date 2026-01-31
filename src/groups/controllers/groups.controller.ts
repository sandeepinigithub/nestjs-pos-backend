import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GroupsService } from '../services/groups.service';
import { CreateGroupDto } from '../dto/create-group.dto';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { GroupResponseDto } from '../dto/group-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { UserResponseDto } from '../../users/dto/user-response.dto';

@ApiTags('Groups')
@Controller('groups')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Create a new group' })
  @ApiResponse({ status: 201, description: 'Group created successfully', type: GroupResponseDto })
  @ApiResponse({ status: 409, description: 'Group code already exists' })
  async create(
    @Body() createGroupDto: CreateGroupDto,
    @CurrentUser() currentUser: UserResponseDto,
  ): Promise<GroupResponseDto> {
    return this.groupsService.create(createGroupDto, currentUser);
  }

  @Get()
  @ApiOperation({ summary: 'Get all groups' })
  @ApiResponse({ status: 200, description: 'Groups retrieved successfully', type: [GroupResponseDto] })
  async findAll(): Promise<GroupResponseDto[]> {
    return this.groupsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a group by ID' })
  @ApiResponse({ status: 200, description: 'Group retrieved successfully', type: GroupResponseDto })
  @ApiResponse({ status: 404, description: 'Group not found' })
  async findOne(@Param('id') id: string): Promise<GroupResponseDto> {
    return this.groupsService.findOne(id);
  }

  @Get(':id/hierarchy')
  @ApiOperation({ summary: 'Get group hierarchy (all ancestors)' })
  @ApiResponse({ status: 200, description: 'Hierarchy retrieved', type: [GroupResponseDto] })
  async getHierarchy(@Param('id') id: string): Promise<GroupResponseDto[]> {
    return this.groupsService.getHierarchy(id);
  }

  @Get(':id/children')
  @ApiOperation({ summary: 'Get all children of a group' })
  @ApiResponse({ status: 200, description: 'Children retrieved', type: [GroupResponseDto] })
  async getChildren(@Param('id') id: string): Promise<GroupResponseDto[]> {
    return this.groupsService.getChildren(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Update a group' })
  @ApiResponse({ status: 200, description: 'Group updated successfully', type: GroupResponseDto })
  @ApiResponse({ status: 404, description: 'Group not found' })
  async update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
    @CurrentUser() currentUser: UserResponseDto,
  ): Promise<GroupResponseDto> {
    return this.groupsService.update(id, updateGroupDto, currentUser);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a group' })
  @ApiResponse({ status: 204, description: 'Group deleted successfully' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.groupsService.remove(id);
  }
}

