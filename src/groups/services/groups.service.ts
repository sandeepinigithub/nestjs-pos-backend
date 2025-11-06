import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { GroupRepository } from '../repositories/group.repository';
import { CreateGroupDto } from '../dto/create-group.dto';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { GroupResponseDto } from '../dto/group-response.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';

@Injectable()
export class GroupsService {
  constructor(private groupRepository: GroupRepository) {}

  async create(createGroupDto: CreateGroupDto, currentUser?: UserResponseDto): Promise<GroupResponseDto> {
    // Check if code already exists
    const existingGroup = await this.groupRepository.findByCode(createGroupDto.code);
    if (existingGroup) {
      throw new ConflictException('Group with this code already exists');
    }

    // Validate parent if provided
    if (createGroupDto.parentId) {
      const parent = await this.groupRepository.findById(createGroupDto.parentId);
      if (!parent) {
        throw new NotFoundException('Parent group not found');
      }
    }

    // Calculate level
    const level = createGroupDto.parentId
      ? (await this.groupRepository.findHierarchy(createGroupDto.parentId)).length
      : 0;

    const group = await this.groupRepository.create({
      name: createGroupDto.name,
      code: createGroupDto.code,
      description: createGroupDto.description,
      parentId: createGroupDto.parentId,
      level,
      isActive: createGroupDto.isActive ?? true,
      createdBy: currentUser?.id,
    });

    return new GroupResponseDto(group);
  }

  async findAll(): Promise<GroupResponseDto[]> {
    const groups = await this.groupRepository.findMany({
      include: {
        parent: true,
        children: true,
      },
      orderBy: { level: 'asc' },
    });

    return groups.map((group) => new GroupResponseDto(group));
  }

  async findOne(id: string): Promise<GroupResponseDto> {
    const group = await this.groupRepository.findById(id);
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return new GroupResponseDto(group);
  }

  async update(
    id: string,
    updateGroupDto: UpdateGroupDto,
    currentUser?: UserResponseDto,
  ): Promise<GroupResponseDto> {
    const group = await this.groupRepository.findById(id);
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Check if code is being changed and conflicts
    if (updateGroupDto.code && updateGroupDto.code !== group.code) {
      const existingGroup = await this.groupRepository.findByCode(updateGroupDto.code);
      if (existingGroup) {
        throw new ConflictException('Group with this code already exists');
      }
    }

    // Prevent circular hierarchy
    if (updateGroupDto.parentId) {
      if (updateGroupDto.parentId === id) {
        throw new BadRequestException('Group cannot be its own parent');
      }

      const hierarchy = await this.groupRepository.findHierarchy(id);
      if (hierarchy.some((g) => g.id === updateGroupDto.parentId)) {
        throw new BadRequestException('Circular hierarchy detected');
      }
    }

    const updatedGroup = await this.groupRepository.update(id, {
      ...updateGroupDto,
      updatedBy: currentUser?.id,
    });

    return new GroupResponseDto(updatedGroup);
  }

  async remove(id: string): Promise<void> {
    const group = await this.groupRepository.findById(id);
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Check if group has children
    const children = await this.groupRepository.findChildren(id);
    if (children.length > 0) {
      throw new BadRequestException('Cannot delete group with children. Please delete or reassign children first.');
    }

    await this.groupRepository.delete(id);
  }

  async getHierarchy(id: string): Promise<GroupResponseDto[]> {
    const hierarchy = await this.groupRepository.findHierarchy(id);
    return hierarchy.map((group) => new GroupResponseDto(group));
  }

  async getChildren(id: string): Promise<GroupResponseDto[]> {
    const children = await this.groupRepository.findChildren(id);
    return children.map((group) => new GroupResponseDto(group));
  }
}

