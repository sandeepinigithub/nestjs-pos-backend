import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  OrderChannel,
  Promotion,
  PromotionStatus,
  PromotionType,
} from '@prisma/client';

export class PromotionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({
    description: 'UI-level promotion type',
    enum: ['basic', 'advanced'],
  })
  promotionType: 'basic' | 'advanced';

  @ApiProperty({
    description: 'UI-level status',
    enum: ['active', 'inactive', 'draft'],
  })
  status: 'active' | 'inactive' | 'draft';

  @ApiProperty({ type: [String] })
  outletIds: string[];

  @ApiPropertyOptional({ type: [String] })
  outletNames?: string[];

  @ApiPropertyOptional({
    description: 'Human readable list of outlets (for table display)',
  })
  availableOn?: string;

  @ApiPropertyOptional()
  schedule?: any;

  @ApiPropertyOptional()
  discount?: any;

  @ApiPropertyOptional()
  triggerCondition?: any;

  @ApiPropertyOptional()
  rewardAction?: any;

  @ApiPropertyOptional({ type: [String] })
  orderChannels?: string[];

  @ApiPropertyOptional()
  applicationMethod?: string;

  @ApiPropertyOptional()
  targetAudience?: string;

  @ApiPropertyOptional({ type: [String] })
  customerGroups?: string[];

  @ApiPropertyOptional()
  promoCode?: string;

  @ApiProperty()
  showPromptOnSell: boolean;

  @ApiProperty()
  offerLoyalty: boolean;

  @ApiPropertyOptional({
    description: 'ISO date string (YYYY-MM-DD) for start date',
  })
  startDate?: string | null;

  @ApiPropertyOptional({
    description:
      'ISO date string (YYYY-MM-DD), "No end date", or null for end date',
  })
  endDate?: string | null;

  @ApiPropertyOptional({
    description: 'Whether schedule is recurring',
  })
  recurring?: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(
    promotion: Promotion,
    options?: {
      outletNames?: string[];
    },
  ) {
    this.id = promotion.id;
    this.name = promotion.name;
    this.description = promotion.description || undefined;

    // Map enum to UI strings
    this.promotionType =
      promotion.type === PromotionType.ADVANCED ? 'advanced' : 'basic';

    this.status =
      promotion.status === PromotionStatus.INACTIVE
        ? 'inactive'
        : promotion.status === PromotionStatus.DRAFT
        ? 'draft'
        : 'active';

    this.outletIds = promotion.outletIds ?? [];
    this.outletNames = options?.outletNames;
    this.availableOn =
      this.outletNames && this.outletNames.length > 0
        ? this.outletNames.join(', ')
        : '–';

    this.schedule = promotion.schedule as any;
    this.discount = promotion.discount ?? undefined;
    this.triggerCondition = promotion.triggerCondition ?? undefined;
    this.rewardAction = promotion.rewardAction ?? undefined;

    this.orderChannels = (promotion.orderChannels as OrderChannel[] | null)
      ?.map((ch) => ch.toLowerCase())
      .filter(Boolean) as string[] | undefined;

    this.applicationMethod = promotion.applicationMethod || 'auto';
    this.targetAudience = promotion.targetAudience || 'everyone';
    this.customerGroups = promotion.customerGroups ?? [];
    this.promoCode = promotion.promoCode || undefined;
    this.showPromptOnSell = promotion.showPromptOnSell;
    this.offerLoyalty = promotion.offerLoyalty;

    this.recurring = promotion.scheduleType === 'recurring';

    // Dates for list filters & display
    this.startDate = promotion.startDate
      ? promotion.startDate.toISOString().split('T')[0]
      : null;

    if (promotion.noEndDate) {
      this.endDate = 'No end date';
    } else if (promotion.endDate) {
      this.endDate = promotion.endDate.toISOString().split('T')[0];
    } else {
      this.endDate = null;
    }

    this.createdAt = promotion.createdAt;
    this.updatedAt = promotion.updatedAt;
  }
}

