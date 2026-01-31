import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Tenant, TenantStatus, SubscriptionPlan, SubscriptionStatus } from '@prisma/client';

export class TenantResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  domain?: string;

  @ApiProperty({ enum: TenantStatus })
  status: TenantStatus;

  @ApiProperty({ enum: SubscriptionPlan })
  subscriptionPlan: SubscriptionPlan;

  @ApiPropertyOptional({ enum: SubscriptionStatus })
  subscriptionStatus?: SubscriptionStatus;

  @ApiProperty()
  maxUsers: number;

  @ApiProperty()
  maxStores: number;

  @ApiPropertyOptional()
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };

  @ApiPropertyOptional()
  contact?: {
    primaryContact?: string;
    email?: string;
    phone?: string;
    mobile?: string;
  };

  @ApiProperty()
  currency: string;

  @ApiProperty()
  timezone: string;

  @ApiProperty()
  language: string;

  @ApiProperty()
  dateFormat: string;

  @ApiPropertyOptional()
  features?: {
    inventory?: boolean;
    sales?: boolean;
    purchases?: boolean;
    reports?: boolean;
    multiStore?: boolean;
    apiAccess?: boolean;
  };

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  currentUsers?: number;

  @ApiPropertyOptional()
  currentStores?: number;

  constructor(tenant: Tenant & { currentUsers?: number; currentStores?: number }) {
    this.id = tenant.id;
    this.code = tenant.code;
    this.name = tenant.name;
    this.domain = tenant.domain || undefined;
    this.status = tenant.status;
    this.subscriptionPlan = tenant.subscriptionPlan;
    // Get subscription status from tenant
    this.subscriptionStatus = tenant.subscriptionStatus;
    this.maxUsers = tenant.maxUsers;
    this.maxStores = tenant.maxStores;
    this.address = tenant.address ? JSON.parse(tenant.address as any) : undefined;
    this.contact = tenant.email || tenant.phone
      ? {
          email: tenant.email || undefined,
          phone: tenant.phone || undefined,
        }
      : undefined;
    this.currency = tenant.currency;
    this.timezone = tenant.timezone;
    this.language = tenant.language;
    this.dateFormat = tenant.dateFormat;
    // Parse features if it's a JSON string
    if (tenant.features && typeof tenant.features === 'string') {
      try {
        this.features = JSON.parse(tenant.features);
      } catch {
        this.features = undefined;
      }
    } else if (tenant.features) {
      this.features = tenant.features as any;
    }
    this.notes = tenant.notes || undefined;
    this.isActive = tenant.isActive;
    this.createdAt = tenant.createdAt;
    this.updatedAt = tenant.updatedAt;
    this.currentUsers = tenant.currentUsers;
    this.currentStores = tenant.currentStores;
  }
}
