import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VendorResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  companyName?: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  workPhone?: string;

  @ApiPropertyOptional()
  mobilePhone?: string;

  @ApiPropertyOptional()
  address?: string;

  @ApiPropertyOptional()
  city?: string;

  @ApiPropertyOptional()
  state?: string;

  @ApiPropertyOptional()
  zipCode?: string;

  @ApiPropertyOptional()
  country?: string;

  @ApiPropertyOptional()
  payables?: number;

  @ApiPropertyOptional()
  unusedCredits?: number;

  @ApiPropertyOptional()
  currency?: string;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  paymentTerms?: string;

  @ApiPropertyOptional()
  taxId?: string;

  @ApiPropertyOptional()
  notes?: string;

  constructor(supplier: any) {
    this.id = supplier.id;
    this.name = supplier.name;
    this.companyName = supplier.name;
    this.email = supplier.email ?? undefined;
    this.workPhone = supplier.phone ?? undefined;
    this.mobilePhone = supplier.mobile ?? undefined;
    this.address = supplier.address ?? undefined;
    this.city = supplier.city ?? undefined;
    this.state = supplier.state ?? undefined;
    this.zipCode = supplier.postalCode ?? undefined;
    this.country = supplier.country ?? undefined;
    this.payables = 0;
    this.unusedCredits = 0;
    this.currency = 'INR';
    this.status = supplier.isActive ? 'active' : 'inactive';
    this.paymentTerms = supplier.paymentTerms ?? undefined;
    this.taxId = supplier.taxId ?? undefined;
    this.notes = supplier.notes ?? undefined;
  }
}
