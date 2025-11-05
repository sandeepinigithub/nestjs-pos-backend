import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User, UserRole, UserStatus, Prisma } from '@prisma/client';

/**
 * Repository Pattern for User data access
 * Benefits:
 * - Separates data access from business logic
 * - Easy to add caching layer
 * - Easy to mock for testing
 * - Centralized query optimization
 */
@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  /**
   * Find user by email or username
   */
  async findByEmailOrUsername(email?: string, username?: string): Promise<User | null> {
    if (!email && !username) return null;

    const conditions: Prisma.UserWhereInput[] = [];
    if (email) conditions.push({ email });
    if (username) conditions.push({ username });

    return this.prisma.user.findFirst({
      where: {
        OR: conditions,
      },
    });
  }

  /**
   * Check if user exists by email
   */
  async existsByEmail(email: string, excludeId?: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        ...(excludeId && { id: { not: excludeId } }),
      },
      select: { id: true },
    });
    return !!user;
  }

  /**
   * Check if user exists by username
   */
  async existsByUsername(username: string, excludeId?: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        username,
        ...(excludeId && { id: { not: excludeId } }),
      },
      select: { id: true },
    });
    return !!user;
  }

  /**
   * Find many users with pagination and filters
   */
  async findMany(params: {
    page: number;
    limit: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
    select?: Prisma.UserSelect;
  }): Promise<{ users: User[]; total: number }> {
    const { page, limit, where, orderBy, select } = params;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: orderBy || { createdAt: 'desc' },
        select,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  /**
   * Create a new user
   */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  /**
   * Update user by ID
   */
  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete user by ID
   */
  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Update user's last login timestamp
   */
  async updateLastLogin(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  /**
   * Execute within a transaction
   */
  async transaction<T>(callback: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(callback);
  }
}

