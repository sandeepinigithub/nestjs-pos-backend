import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { PaginationDto, PaginationResponseDto } from '../common/dto/pagination.dto';
import { AuthService } from '../auth/auth.service';
import { PermissionService } from '../common/services/permission.service';
import { UserRepository } from './repositories/user.repository';
import { UserRole, UserStatus } from '@prisma/client';

/**
 * Refactored UsersService with:
 * - Repository pattern for data access
 * - Permission service for authorization
 * - Better separation of concerns
 * - Type-safe queries
 */
@Injectable()
export class UsersService {
  constructor(
    private userRepository: UserRepository,
    private authService: AuthService,
    private permissionService: PermissionService,
  ) {}

  async create(createUserDto: CreateUserDto, currentUser?: UserResponseDto): Promise<UserResponseDto> {
    // Check permissions
    if (!this.permissionService.canCreateUser(currentUser)) {
      throw new ForbiddenException('You do not have permission to create users');
    }

    // Check if user already exists using repository
    const existingUser = await this.userRepository.findByEmailOrUsername(
      createUserDto.email,
      createUserDto.username,
    );

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

    // Create user using repository
    const user = await this.userRepository.create({
      email: createUserDto.email,
      username: createUserDto.username,
      password: hashedPassword,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      phone: createUserDto.phone,
      role: createUserDto.role || UserRole.USER,
      status: UserStatus.PENDING_VERIFICATION,
      ...(currentUser?.id ? { createdBy: currentUser.id } : {}),
    });

    return new UserResponseDto(user);
  }

  async findAll(
    paginationDto: PaginationDto,
    currentUser?: UserResponseDto,
  ): Promise<PaginationResponseDto<UserResponseDto>> {
    const { page = 1, limit = 10 } = paginationDto;

    // Non-admins can only see active users
    const where: { status?: UserStatus } = {};
    if (!this.permissionService.canViewAllUsers(currentUser)) {
      where.status = UserStatus.ACTIVE;
    }

    const select = {
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
    } as const;

    const { users, total } = await this.userRepository.findMany({
      page,
      limit,
      where,
      orderBy: { createdAt: 'desc' },
      select,
    });

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
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check permissions using permission service
    if (!this.permissionService.canViewUser(currentUser, id)) {
      throw new ForbiddenException('You do not have permission to view this user');
    }

    return new UserResponseDto(user);
  }

  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.userRepository.findByEmail(email);
    return user ? new UserResponseDto(user) : null;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser?: UserResponseDto,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check permissions
    if (!this.permissionService.canUpdateUser(currentUser, id)) {
      throw new ForbiddenException('You do not have permission to update this user');
    }

    // Prevent non-admins from changing roles
    if (updateUserDto.role && !this.permissionService.canChangeUserRole(currentUser)) {
      throw new ForbiddenException('You do not have permission to change user roles');
    }

    // Check for email/username conflicts using repository
    if (updateUserDto.email || updateUserDto.username) {
      if (updateUserDto.email && (await this.userRepository.existsByEmail(updateUserDto.email, id))) {
        throw new ConflictException('User with this email already exists');
      }
      if (
        updateUserDto.username &&
        (await this.userRepository.existsByUsername(updateUserDto.username, id))
      ) {
        throw new ConflictException('User with this username already exists');
      }
    }

    const updateData: any = { ...updateUserDto };
    if (currentUser?.id) {
      updateData.updatedBy = currentUser.id;
    }
    const updatedUser = await this.userRepository.update(id, updateData);

    return new UserResponseDto(updatedUser);
  }

  async remove(id: string, currentUser?: UserResponseDto): Promise<void> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check permissions
    if (!this.permissionService.canDeleteUser(currentUser, id)) {
      throw new ForbiddenException('You do not have permission to delete this user');
    }

    // Prevent self-deletion for super admins (handled in permission service)
    if (currentUser && currentUser.id === id && currentUser.role === UserRole.SUPER_ADMIN) {
      throw new BadRequestException('Super admin cannot delete their own account');
    }

    await this.userRepository.delete(id);
  }

  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
    currentUser?: UserResponseDto,
  ): Promise<void> {
    // Check permissions
    if (!this.permissionService.canChangePassword(currentUser, id)) {
      throw new ForbiddenException('You can only change your own password');
    }

    const user = await this.userRepository.findById(id);

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

    // Update password using repository
    const updateData: any = { password: hashedPassword };
    if (currentUser?.id) {
      updateData.updatedBy = currentUser.id;
    }
    await this.userRepository.update(id, updateData);
  }

  async updateStatus(
    id: string,
    status: UserStatus,
    currentUser?: UserResponseDto,
  ): Promise<UserResponseDto> {
    // Check permissions
    if (!this.permissionService.canUpdateUserStatus(currentUser)) {
      throw new ForbiddenException('You do not have permission to update user status');
    }

    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updateData: any = { status };
    if (currentUser?.id) {
      updateData.updatedBy = currentUser.id;
    }
    const updatedUser = await this.userRepository.update(id, updateData);

    return new UserResponseDto(updatedUser);
  }
}

