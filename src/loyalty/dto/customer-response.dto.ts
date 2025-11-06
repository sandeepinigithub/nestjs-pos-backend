import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CustomerResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  customerNumber: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  address?: string;

  @ApiProperty()
  loyaltyPoints: number;

  @ApiPropertyOptional()
  tier?: string;

  @ApiProperty()
  joinedAt: Date;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(customer: any) {
    this.id = customer.id;
    this.customerNumber = customer.customerNumber;
    this.firstName = customer.firstName;
    this.lastName = customer.lastName;
    this.email = customer.email;
    this.phone = customer.phone;
    this.address = customer.address;
    this.loyaltyPoints = customer.loyaltyPoints;
    this.tier = customer.tier;
    this.joinedAt = customer.joinedAt;
    this.isActive = customer.isActive;
    this.createdAt = customer.createdAt;
    this.updatedAt = customer.updatedAt;
  }
}

