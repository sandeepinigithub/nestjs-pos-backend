import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UserResponseDto } from '../../users/dto/user-response.dto';

/**
 * Centralized permission service for all authorization checks
 * This eliminates code duplication and makes permissions easier to maintain
 */
@Injectable()
export class PermissionService {
  /**
   * Check if user can create other users
   */
  canCreateUser(currentUser?: UserResponseDto): boolean {
    if (!currentUser) return false;
    return currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.ADMIN;
  }

  /**
   * Check if user can view all users (not just their own)
   */
  canViewAllUsers(currentUser?: UserResponseDto): boolean {
    if (!currentUser) return false;
    return currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.ADMIN;
  }

  /**
   * Check if user can view a specific user
   */
  canViewUser(currentUser: UserResponseDto | undefined, targetUserId: string): boolean {
    if (!currentUser) return false;
    // Users can view their own profile
    if (currentUser.id === targetUserId) return true;
    // Admins can view any user
    return this.canViewAllUsers(currentUser);
  }

  /**
   * Check if user can update a specific user
   */
  canUpdateUser(currentUser: UserResponseDto | undefined, targetUserId: string): boolean {
    if (!currentUser) return false;
    // Users can update their own profile
    if (currentUser.id === targetUserId) return true;
    // Admins can update any user
    return this.canViewAllUsers(currentUser);
  }

  /**
   * Check if user can delete a specific user
   */
  canDeleteUser(currentUser: UserResponseDto | undefined, targetUserId: string): boolean {
    if (!currentUser) return false;
    // Prevent self-deletion for super admins
    if (currentUser.id === targetUserId && currentUser.role === UserRole.SUPER_ADMIN) {
      return false;
    }
    // Only admins can delete users
    return this.canViewAllUsers(currentUser);
  }

  /**
   * Check if user can change user roles
   */
  canChangeUserRole(currentUser?: UserResponseDto): boolean {
    return this.canViewAllUsers(currentUser);
  }

  /**
   * Check if user can update user status
   */
  canUpdateUserStatus(currentUser?: UserResponseDto): boolean {
    return this.canViewAllUsers(currentUser);
  }

  /**
   * Check if user can change password for a specific user
   */
  canChangePassword(currentUser: UserResponseDto | undefined, targetUserId: string): boolean {
    if (!currentUser) return false;
    // Users can change their own password
    if (currentUser.id === targetUserId) return true;
    // Admins can change any user's password
    return this.canViewAllUsers(currentUser);
  }

  /**
   * Check if user has admin privileges
   */
  isAdmin(currentUser?: UserResponseDto): boolean {
    if (!currentUser) return false;
    return currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.ADMIN;
  }
}

