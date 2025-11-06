import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PermissionRepository } from '../repositories/permission.repository';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { PermissionResponseDto } from '../dto/permission-response.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';

@Injectable()
export class PermissionsService {
  constructor(private permissionRepository: PermissionRepository) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<PermissionResponseDto> {
    // Check if permission already exists
    const existing = await this.permissionRepository.findByResourceAndAction(
      createPermissionDto.resource,
      createPermissionDto.action,
    );

    if (existing) {
      throw new ConflictException('Permission with this resource and action already exists');
    }

    const permission = await this.permissionRepository.create({
      resource: createPermissionDto.resource,
      action: createPermissionDto.action,
      name: createPermissionDto.name,
      description: createPermissionDto.description,
      module: createPermissionDto.module,
      isActive: createPermissionDto.isActive ?? true,
    });

    return new PermissionResponseDto(permission);
  }

  async findAll(): Promise<PermissionResponseDto[]> {
    const permissions = await this.permissionRepository.findMany({
      orderBy: [{ module: 'asc' }, { resource: 'asc' }, { action: 'asc' }],
    });

    return permissions.map((permission) => new PermissionResponseDto(permission));
  }

  async findOne(id: string): Promise<PermissionResponseDto> {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return new PermissionResponseDto(permission);
  }

  async findByModule(module: string): Promise<PermissionResponseDto[]> {
    const permissions = await this.permissionRepository.findByModule(module);
    return permissions.map((permission) => new PermissionResponseDto(permission));
  }

  async checkUserPermission(
    userId: string,
    resource: string,
    action: string,
    storeId?: string,
  ): Promise<boolean> {
    // This will be implemented with the permission checking logic
    // TODO: Implement full permission checking with groups, direct permissions, etc.
    return false;
  }
}

