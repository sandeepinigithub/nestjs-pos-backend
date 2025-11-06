import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StoreType, StoreStatus, SyncStatus } from '@prisma/client';

export class StoreResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: StoreType })
  storeType: StoreType;

  @ApiProperty({ enum: StoreStatus })
  status: StoreStatus;

  @ApiProperty()
  countryId: string;

  @ApiProperty()
  regionId: string;

  @ApiPropertyOptional()
  parentStoreId?: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  city: string;

  @ApiPropertyOptional()
  state?: string;

  @ApiPropertyOptional()
  postalCode?: string;

  @ApiPropertyOptional()
  latitude?: number;

  @ApiPropertyOptional()
  longitude?: number;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiProperty()
  timezone: string;

  @ApiProperty()
  currency: string;

  @ApiPropertyOptional()
  taxConfig?: any;

  @ApiPropertyOptional()
  paymentConfig?: any;

  @ApiPropertyOptional()
  localServerUrl?: string;

  @ApiPropertyOptional()
  lastSyncAt?: Date;

  @ApiProperty({ enum: SyncStatus })
  syncStatus: SyncStatus;

  @ApiProperty({ enum: StoreType })
  ownershipType: StoreType;

  @ApiPropertyOptional()
  licenseNumber?: string;

  @ApiPropertyOptional()
  licenseExpiry?: Date;

  @ApiProperty()
  isActive: boolean;

  @ApiPropertyOptional()
  openedAt?: Date;

  @ApiPropertyOptional()
  closedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(store: any) {
    this.id = store.id;
    this.code = store.code;
    this.name = store.name;
    this.storeType = store.storeType;
    this.status = store.status;
    this.countryId = store.countryId;
    this.regionId = store.regionId;
    this.parentStoreId = store.parentStoreId;
    this.address = store.address;
    this.city = store.city;
    this.state = store.state;
    this.postalCode = store.postalCode;
    this.latitude = store.latitude;
    this.longitude = store.longitude;
    this.phone = store.phone;
    this.email = store.email;
    this.timezone = store.timezone;
    this.currency = store.currency;
    this.taxConfig = store.taxConfig;
    this.paymentConfig = store.paymentConfig;
    this.localServerUrl = store.localServerUrl;
    this.lastSyncAt = store.lastSyncAt;
    this.syncStatus = store.syncStatus;
    this.ownershipType = store.ownershipType;
    this.licenseNumber = store.licenseNumber;
    this.licenseExpiry = store.licenseExpiry;
    this.isActive = store.isActive;
    this.openedAt = store.openedAt;
    this.closedAt = store.closedAt;
    this.createdAt = store.createdAt;
    this.updatedAt = store.updatedAt;
  }
}

