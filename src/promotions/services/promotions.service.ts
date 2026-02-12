import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderChannel,
  Promotion,
  PromotionStatus,
  PromotionType,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PromotionRepository } from '../repositories/promotion.repository';
import { CreatePromotionDto } from '../dto/create-promotion.dto';
import { UpdatePromotionDto } from '../dto/update-promotion.dto';
import { PromotionResponseDto } from '../dto/promotion-response.dto';
import { PaginationDto, PaginationResponseDto } from '../../common/dto/pagination.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';

@Injectable()
export class PromotionsService {
  constructor(
    private readonly promotionRepository: PromotionRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(
    dto: CreatePromotionDto,
    currentUser?: UserResponseDto,
  ): Promise<PromotionResponseDto> {
    const { schedule } = dto;
    if (!schedule || typeof schedule !== 'object') {
      throw new BadRequestException('Schedule is required');
    }

    const timing = this.resolveScheduleTiming(schedule);

    const tenantConnect =
      currentUser?.tenantId && currentUser.role !== UserRole.SUPER_ADMIN
        ? { connect: { id: currentUser.tenantId } }
        : undefined;

    const orderChannelsEnum = this.toOrderChannels(dto.orderChannels);

    const promotion = await this.promotionRepository.createPromotion({
      name: dto.name,
      description: dto.description,
      type:
        dto.promotionType === 'advanced'
          ? PromotionType.ADVANCED
          : PromotionType.BASIC,
      status: this.toPromotionStatus(dto.status),
      schedule: schedule as any,
      startDate: timing.startDate,
      endDate: timing.endDate,
      scheduleType: timing.scheduleType,
      noEndDate: timing.noEndDate,
      outletIds: dto.outletIds ?? [],
      orderChannels: orderChannelsEnum,
      applicationMethod: dto.applicationMethod || 'auto',
      targetAudience: dto.targetAudience || 'everyone',
      customerGroups: dto.customerGroups ?? [],
      promoCode: dto.promoCode,
      showPromptOnSell:
        dto.showPromptOnSell !== undefined ? dto.showPromptOnSell : true,
      offerLoyalty: dto.offerLoyalty ?? false,
      discount: dto.discount as any,
      triggerCondition: dto.triggerCondition as any,
      rewardAction: dto.rewardAction as any,
      tenant: tenantConnect,
    });

    const outletNames = await this.resolveOutletNames(promotion.outletIds);

    return new PromotionResponseDto(promotion, { outletNames });
  }

  async update(
    id: string,
    dto: UpdatePromotionDto,
  ): Promise<PromotionResponseDto> {
    const existing = await this.promotionRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Promotion not found');
    }

    const data: Partial<Promotion> & {
      orderChannels?: OrderChannel[];
      schedule?: any;
      discount?: any;
      triggerCondition?: any;
      rewardAction?: any;
    } = {};

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.promotionType !== undefined) {
      data.type =
        dto.promotionType === 'advanced'
          ? PromotionType.ADVANCED
          : PromotionType.BASIC;
    }
    if (dto.status !== undefined) {
      data.status = this.toPromotionStatus(dto.status);
    }
    if (dto.outletIds !== undefined) {
      data.outletIds = dto.outletIds;
    }
    if (dto.orderChannels !== undefined) {
      data.orderChannels = this.toOrderChannels(dto.orderChannels);
    }
    if (dto.applicationMethod !== undefined) {
      data.applicationMethod = dto.applicationMethod;
    }
    if (dto.targetAudience !== undefined) {
      data.targetAudience = dto.targetAudience;
    }
    if (dto.customerGroups !== undefined) {
      data.customerGroups = dto.customerGroups;
    }
    if (dto.promoCode !== undefined) {
      data.promoCode = dto.promoCode;
    }
    if (dto.showPromptOnSell !== undefined) {
      data.showPromptOnSell = dto.showPromptOnSell;
    }
    if (dto.offerLoyalty !== undefined) {
      data.offerLoyalty = dto.offerLoyalty;
    }
    if (dto.discount !== undefined) {
      data.discount = dto.discount as any;
    }
    if (dto.triggerCondition !== undefined) {
      data.triggerCondition = dto.triggerCondition as any;
    }
    if (dto.rewardAction !== undefined) {
      data.rewardAction = dto.rewardAction as any;
    }
    if (dto.schedule !== undefined) {
      const timing = this.resolveScheduleTiming(dto.schedule);
      data.schedule = dto.schedule as any;
      data.startDate = timing.startDate;
      data.endDate = timing.endDate;
      data.scheduleType = timing.scheduleType;
      data.noEndDate = timing.noEndDate;
    }

    const updated = await this.promotionRepository.updatePromotion(id, data);
    const outletNames = await this.resolveOutletNames(updated.outletIds);

    return new PromotionResponseDto(updated, { outletNames });
  }

  async remove(id: string): Promise<void> {
    const existing = await this.promotionRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Promotion not found');
    }
    await this.promotionRepository.deletePromotion(id);
  }

  async findOne(id: string): Promise<PromotionResponseDto> {
    const promotion = await this.promotionRepository.findById(id);
    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }
    const outletNames = await this.resolveOutletNames(promotion.outletIds);
    return new PromotionResponseDto(promotion, { outletNames });
  }

  async findAll(
    pagination: PaginationDto,
    filters: {
      tab?: 'current' | 'past' | 'all';
      search?: string;
      from?: string;
      to?: string;
      outletId?: string;
      tenantId?: string;
    },
  ): Promise<PaginationResponseDto<PromotionResponseDto>> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.tenantId) {
      where.tenantId = filters.tenantId;
    }

    if (filters.search) {
      const q = filters.search;
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (filters.outletId) {
      where.outletIds = { has: filters.outletId };
    }

    const now = new Date();
    const andClauses: any[] = [];

    if (filters.tab === 'current') {
      andClauses.push({
        status: PromotionStatus.ACTIVE,
      });
      andClauses.push({
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      });
    } else if (filters.tab === 'past') {
      andClauses.push({
        endDate: { lt: now },
      });
    }

    if (filters.from && filters.to) {
      const fromDate = new Date(filters.from);
      const toDate = new Date(filters.to);
      andClauses.push({
        OR: [
          {
            AND: [{ startDate: { gte: fromDate } }, { startDate: { lte: toDate } }],
          },
          {
            AND: [{ endDate: { gte: fromDate } }, { endDate: { lte: toDate } }],
          },
          {
            AND: [{ startDate: { lte: fromDate } }, { endDate: { gte: toDate } }],
          },
        ],
      });
    }

    if (andClauses.length) {
      where.AND = andClauses;
    }

    const [items, total] = await Promise.all([
      this.promotionRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: 'asc' },
      }),
      this.promotionRepository.count(where),
    ]);

    const allOutletIds = Array.from(
      new Set(items.flatMap((p) => p.outletIds ?? [])),
    );
    const outletMap = await this.buildOutletMap(allOutletIds);

    const data = items.map(
      (p) =>
        new PromotionResponseDto(p, {
          outletNames: (p.outletIds ?? []).map(
            (id) => outletMap.get(id) || 'Unknown',
          ),
        }),
    );

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMetadata(currentUser?: UserResponseDto): Promise<{
    outlets: { id: string; name: string }[];
  }> {
    const where: any = { isActive: true };

    if (currentUser?.tenantId && currentUser.role !== UserRole.SUPER_ADMIN) {
      where.tenantId = currentUser.tenantId;
    }

    const stores = await this.prisma.store.findMany({
      where,
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    });

    return {
      outlets: stores.map((s) => ({ id: s.id, name: s.name })),
    };
  }

  private resolveScheduleTiming(schedule: any): {
    startDate: Date | null;
    endDate: Date | null;
    scheduleType: string | null;
    noEndDate: boolean;
  } {
    const type = schedule?.type ?? 'one-time';

    if (type === 'recurring') {
      const start =
        schedule.startDate != null ? new Date(schedule.startDate) : null;
      const end =
        schedule.endDate != null ? new Date(schedule.endDate) : null;
      return {
        startDate: start,
        endDate: end,
        scheduleType: 'recurring',
        noEndDate: false,
      };
    }

    const noEndDate = !!schedule.noEndDate;
    const start =
      schedule.startDate != null ? new Date(schedule.startDate) : null;
    const end =
      !noEndDate && schedule.endDate != null
        ? new Date(schedule.endDate)
        : null;

    return {
      startDate: start,
      endDate: end,
      scheduleType: 'one-time',
      noEndDate,
    };
  }

  private toPromotionStatus(
    status?: string,
  ): PromotionStatus {
    switch (status) {
      case 'inactive':
        return PromotionStatus.INACTIVE;
      case 'draft':
        return PromotionStatus.DRAFT;
      default:
        return PromotionStatus.ACTIVE;
    }
  }

  private toOrderChannels(
    channels?: string[],
  ): OrderChannel[] {
    if (!channels || !channels.length) {
      return [];
    }
    const map: Record<string, OrderChannel> = {
      dine_in: OrderChannel.DINE_IN,
      takeaway: OrderChannel.TAKEAWAY,
      delivery: OrderChannel.DELIVERY,
      online: OrderChannel.ONLINE,
      all: OrderChannel.ALL,
    };
    return channels
      .map((c) => map[c])
      .filter(Boolean) as OrderChannel[];
  }

  private async resolveOutletNames(
    outletIds: string[] | null,
  ): Promise<string[]> {
    if (!outletIds || !outletIds.length) {
      return [];
    }
    const map = await this.buildOutletMap(outletIds);
    return outletIds.map((id) => map.get(id) || 'Unknown');
  }

  private async buildOutletMap(
    outletIds: string[],
  ): Promise<Map<string, string>> {
    if (!outletIds.length) {
      return new Map();
    }
    const stores = await this.prisma.store.findMany({
      where: { id: { in: [...new Set(outletIds)] } },
      select: { id: true, name: true },
    });
    return new Map(stores.map((s) => [s.id, s.name]));
  }
}

