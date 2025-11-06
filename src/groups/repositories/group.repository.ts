import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Group, Prisma } from '@prisma/client';

@Injectable()
export class GroupRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Group | null> {
    return this.prisma.group.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async findByCode(code: string): Promise<Group | null> {
    return this.prisma.group.findUnique({
      where: { code },
    });
  }

  async findMany(params: {
    where?: Prisma.GroupWhereInput;
    include?: Prisma.GroupInclude;
    orderBy?: Prisma.GroupOrderByWithRelationInput;
  }): Promise<Group[]> {
    return this.prisma.group.findMany(params);
  }

  async create(data: Prisma.GroupCreateInput): Promise<Group> {
    return this.prisma.group.create({
      data,
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async update(id: string, data: Prisma.GroupUpdateInput): Promise<Group> {
    return this.prisma.group.update({
      where: { id },
      data,
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.group.delete({
      where: { id },
    });
  }

  async findChildren(parentId: string): Promise<Group[]> {
    return this.prisma.group.findMany({
      where: { parentId },
    });
  }

  async findHierarchy(groupId: string): Promise<Group[]> {
    const group = await this.findById(groupId);
    if (!group) return [];

    const hierarchy: Group[] = [];
    let current: Group | null = group;

    // Get all ancestors
    while (current) {
      hierarchy.unshift(current);
      if (current.parentId) {
        current = await this.findById(current.parentId);
      } else {
        current = null;
      }
    }

    return hierarchy;
  }

  async count(where?: Prisma.GroupWhereInput): Promise<number> {
    return this.prisma.group.count({ where });
  }
}

