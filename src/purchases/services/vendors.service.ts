import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PurchaseRepository } from '../repositories/purchase.repository';
import { CreateVendorDto } from '../dto/create-vendor.dto';
import { UpdateVendorDto } from '../dto/update-vendor.dto';
import { VendorResponseDto } from '../dto/vendor-response.dto';
import { ListVendorsQueryDto } from '../dto/list-vendors-query.dto';
import { PaginationResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class VendorsService {
  constructor(private readonly purchaseRepository: PurchaseRepository) {}

  async findAll(
    query: ListVendorsQueryDto,
  ): Promise<PaginationResponseDto<VendorResponseDto>> {
    const { page = 1, limit = 10, search, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status && status !== 'all') {
      where.isActive = status === 'active';
    }
    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { contactPerson: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [suppliers, total] = await Promise.all([
      this.purchaseRepository.findSuppliers({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.purchaseRepository.countSuppliers(where),
    ]);

    return {
      data: suppliers.map((s) => new VendorResponseDto(s)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<VendorResponseDto> {
    const supplier = await this.purchaseRepository.findSupplierById(id);
    if (!supplier) {
      throw new NotFoundException('Vendor not found');
    }
    return new VendorResponseDto(supplier);
  }

  async create(dto: CreateVendorDto): Promise<VendorResponseDto> {
    const code = await this.purchaseRepository.getNextSupplierCode();
    const name = dto.companyName?.trim() || dto.displayName?.trim();
    const supplier = await this.purchaseRepository.createSupplier({
      code,
      name,
      contactPerson: dto.displayName?.trim() || undefined,
      email: dto.email?.trim() || undefined,
      phone: dto.workPhone?.trim() || undefined,
      mobile: dto.mobilePhone?.trim() || undefined,
      address: dto.address?.trim() || undefined,
      city: dto.city?.trim() || undefined,
      state: dto.state?.trim() || undefined,
      postalCode: dto.zipCode?.trim() || undefined,
      country: dto.country?.trim() || undefined,
      paymentTerms: dto.paymentTerms?.trim() || undefined,
      taxId: dto.taxId?.trim() || undefined,
      notes: dto.notes?.trim() || undefined,
      isActive: dto.status !== 'inactive',
    });
    return new VendorResponseDto(supplier);
  }

  async update(id: string, dto: UpdateVendorDto): Promise<VendorResponseDto> {
    const existing = await this.purchaseRepository.findSupplierById(id);
    if (!existing) {
      throw new NotFoundException('Vendor not found');
    }
    const name = dto.companyName !== undefined ? dto.companyName : (dto.displayName !== undefined ? dto.displayName : existing.name);
    await this.purchaseRepository.updateSupplier(id, {
      ...(name !== undefined && { name: name.trim() }),
      ...(dto.displayName !== undefined && { contactPerson: dto.displayName.trim() || undefined }),
      ...(dto.email !== undefined && { email: dto.email.trim() || undefined }),
      ...(dto.workPhone !== undefined && { phone: dto.workPhone.trim() || undefined }),
      ...(dto.mobilePhone !== undefined && { mobile: dto.mobilePhone.trim() || undefined }),
      ...(dto.address !== undefined && { address: dto.address.trim() || undefined }),
      ...(dto.city !== undefined && { city: dto.city.trim() || undefined }),
      ...(dto.state !== undefined && { state: dto.state.trim() || undefined }),
      ...(dto.zipCode !== undefined && { postalCode: dto.zipCode.trim() || undefined }),
      ...(dto.country !== undefined && { country: dto.country.trim() || undefined }),
      ...(dto.paymentTerms !== undefined && { paymentTerms: dto.paymentTerms.trim() || undefined }),
      ...(dto.taxId !== undefined && { taxId: dto.taxId.trim() || undefined }),
      ...(dto.notes !== undefined && { notes: dto.notes.trim() || undefined }),
      ...(dto.status !== undefined && { isActive: dto.status === 'active' }),
    });
    const updated = await this.purchaseRepository.findSupplierById(id);
    return new VendorResponseDto(updated!);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.purchaseRepository.findSupplierById(id);
    if (!existing) {
      throw new NotFoundException('Vendor not found');
    }
    const orderCount = await this.purchaseRepository.countPurchaseOrders({
      supplierId: id,
    });
    if (orderCount > 0) {
      throw new BadRequestException(
        'Cannot delete vendor with existing purchase orders',
      );
    }
    await this.purchaseRepository.deleteSupplier(id);
  }
}
