import { UserRole, UserStatus } from '@prisma/client';

export class UserResponseDto {
  id: string;
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  emailVerifiedAt?: Date;
  lastLoginAt?: Date;
  profileImage?: string;
  tenantId?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(user: any) {
    this.id = user.id;
    this.email = user.email;
    this.username = user.username;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.phone = user.phone;
    this.role = user.role;
    this.status = user.status;
    this.emailVerified = user.emailVerified;
    this.emailVerifiedAt = user.emailVerifiedAt;
    this.lastLoginAt = user.lastLoginAt;
    this.profileImage = user.profileImage;
    this.tenantId = user.tenantId;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}

