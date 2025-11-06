import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { StoreRepository } from '../repositories/store.repository';
import { CreateStoreDto } from '../dto/create-store.dto';
import { StoreResponseDto } from '../dto/store-response.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { PaginationDto, PaginationResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class StoresService {
  constructor(private storeRepository: StoreRepository) {}

  async create(createStoreDto: CreateStoreDto, currentUser?: UserResponseDto): Promise<StoreResponseDto> {
    // Check if store code already exists
    const existingStore = await this.storeRepository.findByCode(createStoreDto.code);
    if (existingStore) {
      throw new ConflictException('Store with this code already exists');
    }

    // Validate parent store if provided
    if (createStoreDto.parentStoreId) {
      const parentStore = await this.storeRepository.findById(createStoreDto.parentStoreId);
      if (!parentStore) {
        throw new NotFoundException('Parent store not found');
      }
    }

    const store = await this.storeRepository.create({
      code: createStoreDto.code,
      name: createStoreDto.name,
      storeType: createStoreDto.storeType,
      status: createStoreDto.status || 'ACTIVE',
      country: { connect: { id: createStoreDto.countryId } },
      region: { connect: { id: createStoreDto.regionId } },
      parentStore: createStoreDto.parentStoreId
        ? { connect: { id: createStoreDto.parentStoreId } }
        : undefined,
      address: createStoreDto.address,
      city: createStoreDto.city,
      state: createStoreDto.state,
      postalCode: createStoreDto.postalCode,
      latitude: createStoreDto.latitude,
      longitude: createStoreDto.longitude,
      phone: createStoreDto.phone,
      email: createStoreDto.email,
      timezone: createStoreDto.timezone,
      currency: createStoreDto.currency,
      taxConfig: createStoreDto.taxConfig,
      paymentConfig: createStoreDto.paymentConfig,
      localServerUrl: createStoreDto.localServerUrl,
      ownershipType: createStoreDto.ownershipType,
      licenseNumber: createStoreDto.licenseNumber,
      licenseExpiry: createStoreDto.licenseExpiry,
      openedAt: createStoreDto.openedAt,
      createdBy: currentUser?.id,
    });

    return new StoreResponseDto(store);
  }

  async findAll(
    paginationDto: PaginationDto,
    filters?: { storeType?: string; status?: string; regionId?: string },
  ): Promise<PaginationResponseDto<StoreResponseDto>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.storeType) where.storeType = filters.storeType;
    if (filters?.status) where.status = filters.status;
    if (filters?.regionId) where.regionId = filters.regionId;

    const [stores, total] = await Promise.all([
      this.storeRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          country: true,
          region: true,
        },
      }),
      this.storeRepository.count({ where }),
    ]);

    return {
      data: stores.map((store) => new StoreResponseDto(store)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<StoreResponseDto> {
    const store = await this.storeRepository.findById(id);
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return new StoreResponseDto(store);
  }

  async findByRegion(regionId: string): Promise<StoreResponseDto[]> {
    const stores = await this.storeRepository.findByRegion(regionId);
    return stores.map((store) => new StoreResponseDto(store));
  }

  async findByType(storeType: string): Promise<StoreResponseDto[]> {
    const stores = await this.storeRepository.findByType(storeType as any);
    return stores.map((store) => new StoreResponseDto(store));
  }

  async getChildren(storeId: string): Promise<StoreResponseDto[]> {
    const children = await this.storeRepository.findChildren(storeId);
    return children.map((store) => new StoreResponseDto(store));
  }
}

