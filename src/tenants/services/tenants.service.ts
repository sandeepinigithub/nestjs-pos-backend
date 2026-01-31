import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { TenantRepository } from '../repositories/tenant.repository';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { UpdateTenantDto } from '../dto/update-tenant.dto';
import { TenantResponseDto } from '../dto/tenant-response.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { PaginationDto, PaginationResponseDto } from '../../common/dto/pagination.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class TenantsService {
  constructor(
    private tenantRepository: TenantRepository,
    private prisma: PrismaService,
  ) {}

  async create(createTenantDto: CreateTenantDto, currentUser?: UserResponseDto): Promise<TenantResponseDto> {
    // Check if tenant code already exists
    const existingTenant = await this.tenantRepository.findByCode(createTenantDto.code);
    if (existingTenant) {
      throw new ConflictException('Tenant with this code already exists');
    }

    // Check if domain already exists
    if (createTenantDto.domain) {
      const existingDomain = await this.tenantRepository.findByDomain(createTenantDto.domain);
      if (existingDomain) {
        throw new ConflictException('Tenant with this domain already exists');
      }
    }

    // Prepare address data
    const addressData = createTenantDto.address
      ? {
          street: createTenantDto.address.street,
          city: createTenantDto.address.city,
          state: createTenantDto.address.state,
          zipCode: createTenantDto.address.zipCode,
          country: createTenantDto.address.country,
        }
      : null;

    // Prepare contact data
    const contactData = createTenantDto.contact
      ? {
          primaryContact: createTenantDto.contact.primaryContact,
          email: createTenantDto.contact.email,
          phone: createTenantDto.contact.phone,
          mobile: createTenantDto.contact.mobile,
        }
      : null;

    // Create tenant
    const tenant = await this.tenantRepository.create({
      code: createTenantDto.code,
      name: createTenantDto.name,
      domain: createTenantDto.domain,
      status: createTenantDto.status || 'ACTIVE',
      subscriptionPlan: createTenantDto.subscriptionPlan || SubscriptionPlan.BASIC,
      subscriptionStatus: SubscriptionStatus.TRIAL,
      maxUsers: createTenantDto.maxUsers || 10,
      maxStores: createTenantDto.maxStores || 5,
      address: addressData ? JSON.stringify(addressData) : null,
      city: addressData?.city || null,
      state: addressData?.state || null,
      zipCode: addressData?.zipCode || null,
      country: addressData?.country || null,
      primaryContact: contactData?.primaryContact || null,
      email: contactData?.email || null,
      phone: contactData?.phone || null,
      mobile: contactData?.mobile || null,
      currency: createTenantDto.currency || 'USD',
      timezone: createTenantDto.timezone || 'UTC',
      language: createTenantDto.language || 'en',
      dateFormat: createTenantDto.dateFormat || 'YYYY-MM-DD',
      features: createTenantDto.features ? (createTenantDto.features as any) : undefined,
      notes: createTenantDto.notes,
      subscriptionStartDate: createTenantDto.subscriptionStartDate
        ? new Date(createTenantDto.subscriptionStartDate)
        : new Date(),
      subscriptionEndDate: createTenantDto.subscriptionEndDate
        ? new Date(createTenantDto.subscriptionEndDate)
        : null,
      createdByUser: currentUser?.id ? { connect: { id: currentUser.id } } : undefined,
    });

    // Create initial subscription record
    if (tenant) {
      await this.prisma.subscription.create({
        data: {
          tenantId: tenant.id,
          plan: tenant.subscriptionPlan,
          status: SubscriptionStatus.TRIAL,
          startDate: tenant.subscriptionStartDate || new Date(),
          endDate: tenant.subscriptionEndDate,
          createdBy: currentUser?.id,
        },
      });
    }

    const stats = await this.tenantRepository.getTenantStats(tenant.id);
    return new TenantResponseDto({ ...tenant, ...stats });
  }

  async findAll(
    paginationDto: PaginationDto,
    filters?: { status?: string; subscriptionStatus?: string },
  ): Promise<PaginationResponseDto<TenantResponseDto>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.subscriptionStatus) where.subscriptionStatus = filters.subscriptionStatus;

    const [tenants, total] = await Promise.all([
      this.tenantRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          subscriptions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      this.tenantRepository.count(where),
    ]);

    // Get stats for each tenant
    const tenantsWithStats = await Promise.all(
      tenants.map(async (tenant) => {
        const stats = await this.tenantRepository.getTenantStats(tenant.id);
        return new TenantResponseDto({ ...tenant, ...stats });
      }),
    );

    return {
      data: tenantsWithStats,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<TenantResponseDto> {
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const stats = await this.tenantRepository.getTenantStats(tenant.id);
    return new TenantResponseDto({ ...tenant, ...stats });
  }

  async update(
    id: string,
    updateTenantDto: UpdateTenantDto,
    currentUser?: UserResponseDto,
  ): Promise<TenantResponseDto> {
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Check if code is being changed and if it already exists
    if (updateTenantDto.code && updateTenantDto.code !== tenant.code) {
      const existingTenant = await this.tenantRepository.findByCode(updateTenantDto.code);
      if (existingTenant) {
        throw new ConflictException('Tenant with this code already exists');
      }
    }

    // Check if domain is being changed and if it already exists
    if (updateTenantDto.domain && updateTenantDto.domain !== tenant.domain) {
      const existingDomain = await this.tenantRepository.findByDomain(updateTenantDto.domain);
      if (existingDomain) {
        throw new ConflictException('Tenant with this domain already exists');
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (updateTenantDto.code) updateData.code = updateTenantDto.code;
    if (updateTenantDto.name) updateData.name = updateTenantDto.name;
    if (updateTenantDto.domain !== undefined) updateData.domain = updateTenantDto.domain;
    if (updateTenantDto.status) updateData.status = updateTenantDto.status;
    if (updateTenantDto.subscriptionPlan) updateData.subscriptionPlan = updateTenantDto.subscriptionPlan;
    if (updateTenantDto.maxUsers) updateData.maxUsers = updateTenantDto.maxUsers;
    if (updateTenantDto.maxStores) updateData.maxStores = updateTenantDto.maxStores;
    if (updateTenantDto.currency) updateData.currency = updateTenantDto.currency;
    if (updateTenantDto.timezone) updateData.timezone = updateTenantDto.timezone;
    if (updateTenantDto.language) updateData.language = updateTenantDto.language;
    if (updateTenantDto.dateFormat) updateData.dateFormat = updateTenantDto.dateFormat;
    if (updateTenantDto.notes !== undefined) updateData.notes = updateTenantDto.notes;

    if (updateTenantDto.address) {
      const addressData = {
        street: updateTenantDto.address.street,
        city: updateTenantDto.address.city,
        state: updateTenantDto.address.state,
        zipCode: updateTenantDto.address.zipCode,
        country: updateTenantDto.address.country,
      };
      updateData.address = JSON.stringify(addressData);
      if (addressData.city) updateData.city = addressData.city;
      if (addressData.state) updateData.state = addressData.state;
      if (addressData.zipCode) updateData.zipCode = addressData.zipCode;
      if (addressData.country) updateData.country = addressData.country;
    }

    if (updateTenantDto.contact) {
      const contactData = {
        primaryContact: updateTenantDto.contact.primaryContact,
        email: updateTenantDto.contact.email,
        phone: updateTenantDto.contact.phone,
        mobile: updateTenantDto.contact.mobile,
      };
      if (contactData.primaryContact) updateData.primaryContact = contactData.primaryContact;
      if (contactData.email) updateData.email = contactData.email;
      if (contactData.phone) updateData.phone = contactData.phone;
      if (contactData.mobile) updateData.mobile = contactData.mobile;
    }

    if (updateTenantDto.features) {
      updateData.features = JSON.stringify(updateTenantDto.features);
    }

    if (updateTenantDto.subscriptionStartDate) {
      updateData.subscriptionStartDate = new Date(updateTenantDto.subscriptionStartDate);
    }
    if (updateTenantDto.subscriptionEndDate) {
      updateData.subscriptionEndDate = new Date(updateTenantDto.subscriptionEndDate);
    }

    if (currentUser?.id) {
      updateData.updatedBy = currentUser.id;
    }

    const updatedTenant = await this.tenantRepository.update(id, updateData);
    const stats = await this.tenantRepository.getTenantStats(updatedTenant.id);
    return new TenantResponseDto({ ...updatedTenant, ...stats });
  }

  async remove(id: string): Promise<void> {
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Check if tenant has active stores or users
    const stats = await this.tenantRepository.getTenantStats(id);
    if (stats.currentStores > 0 || stats.currentUsers > 0) {
      throw new BadRequestException(
        'Cannot delete tenant with active stores or users. Please deactivate stores and users first.',
      );
    }

    await this.tenantRepository.delete(id);
  }

  async getTenantStats(id: string): Promise<{
    totalUsers: number;
    totalStores: number;
    currentUsers: number;
    currentStores: number;
  }> {
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return this.tenantRepository.getTenantStats(id);
  }
}
