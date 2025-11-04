import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { PaginationDto, PaginationResponseDto } from '../common/dto/pagination.dto';
import { AuthService } from '../auth/auth.service';
import { UserRole, UserStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async create(createUserDto: CreateUserDto, currentUser?: UserResponseDto): Promise<UserResponseDto> {
    // Check permissions
    if (currentUser && currentUser.role !== UserRole.SUPER_ADMIN && currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You do not have permission to create users');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: createUserDto.email },
          ...(createUserDto.username ? [{ username: createUserDto.username }] : []),
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === createUserDto.email) {
        throw new ConflictException('User with this email already exists');
      }
      if (existingUser.username === createUserDto.username) {
        throw new ConflictException('User with this username already exists');
      }
    }

    // Hash password
    const hashedPassword = await this.authService.hashPassword(createUserDto.password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        username: createUserDto.username,
        password: hashedPassword,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        phone: createUserDto.phone,
        role: createUserDto.role || UserRole.USER,
        status: UserStatus.PENDING_VERIFICATION,
        createdBy: currentUser?.id,
      },
    });

    return new UserResponseDto(user);
  }

  async findAll(
    paginationDto: PaginationDto,
    currentUser?: UserResponseDto,
  ): Promise<PaginationResponseDto<UserResponseDto>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    // Non-admins can only see active users
    const where: any = {};
    if (currentUser && currentUser.role !== UserRole.SUPER_ADMIN && currentUser.role !== UserRole.ADMIN) {
      where.status = UserStatus.ACTIVE;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          status: true,
          emailVerified: true,
          emailVerifiedAt: true,
          lastLoginAt: true,
          profileImage: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((user) => new UserResponseDto(user)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, currentUser?: UserResponseDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Users can only see their own profile unless they're admins
    if (
      currentUser &&
      currentUser.id !== id &&
      currentUser.role !== UserRole.SUPER_ADMIN &&
      currentUser.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('You do not have permission to view this user');
    }

    return new UserResponseDto(user);
  }

  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user ? new UserResponseDto(user) : null;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser?: UserResponseDto,
  ): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check permissions
    if (
      currentUser &&
      currentUser.id !== id &&
      currentUser.role !== UserRole.SUPER_ADMIN &&
      currentUser.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('You do not have permission to update this user');
    }

    // Prevent non-admins from changing roles
    if (
      updateUserDto.role &&
      currentUser &&
      currentUser.role !== UserRole.SUPER_ADMIN &&
      currentUser.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('You do not have permission to change user roles');
    }

    // Check for email/username conflicts
    if (updateUserDto.email || updateUserDto.username) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                ...(updateUserDto.email ? [{ email: updateUserDto.email }] : []),
                ...(updateUserDto.username ? [{ username: updateUserDto.username }] : []),
              ],
            },
          ],
        },
      });

      if (existingUser) {
        if (existingUser.email === updateUserDto.email) {
          throw new ConflictException('User with this email already exists');
        }
        if (existingUser.username === updateUserDto.username) {
          throw new ConflictException('User with this username already exists');
        }
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        updatedBy: currentUser?.id,
      },
    });

    return new UserResponseDto(updatedUser);
  }

  async remove(id: string, currentUser?: UserResponseDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check permissions
    if (
      currentUser &&
      currentUser.id !== id &&
      currentUser.role !== UserRole.SUPER_ADMIN &&
      currentUser.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('You do not have permission to delete this user');
    }

    // Prevent self-deletion for admins
    if (currentUser && currentUser.id === id && currentUser.role === UserRole.SUPER_ADMIN) {
      throw new BadRequestException('Super admin cannot delete their own account');
    }

    await this.prisma.user.delete({
      where: { id },
    });
  }

  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
    currentUser?: UserResponseDto,
  ): Promise<void> {
    // Users can only change their own password unless they're admins
    if (
      currentUser &&
      currentUser.id !== id &&
      currentUser.role !== UserRole.SUPER_ADMIN &&
      currentUser.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('You can only change your own password');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await this.authService.comparePassword(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await this.authService.hashPassword(changePasswordDto.newPassword);

    // Update password
    await this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        updatedBy: currentUser?.id,
      },
    });
  }

  async updateStatus(
    id: string,
    status: UserStatus,
    currentUser?: UserResponseDto,
  ): Promise<UserResponseDto> {
    // Only admins can update status
    if (
      currentUser &&
      currentUser.role !== UserRole.SUPER_ADMIN &&
      currentUser.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('You do not have permission to update user status');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        status,
        updatedBy: currentUser?.id,
      },
    });

    return new UserResponseDto(updatedUser);
  }
}

