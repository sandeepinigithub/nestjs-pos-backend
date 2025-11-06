import { IsString, IsOptional, IsEmail, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ description: 'First name' })
  @IsString()
  @MinLength(1, { message: 'First name is required' })
  @MaxLength(100, { message: 'First name cannot exceed 100 characters' })
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  @IsString()
  @MinLength(1, { message: 'Last name is required' })
  @MaxLength(100, { message: 'Last name cannot exceed 100 characters' })
  lastName: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'City' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'State' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: 'Postal code' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({ description: 'Country' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'Customer preferences (JSON)' })
  @IsOptional()
  preferences?: any;
}

