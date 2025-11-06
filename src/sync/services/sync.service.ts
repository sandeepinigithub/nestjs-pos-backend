import { Injectable } from '@nestjs/common';
import { SyncRepository } from '../repositories/sync.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { SyncStatus, SyncDirection } from '@prisma/client';
import { PaginationDto, PaginationResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class SyncService {
  constructor(
    private syncRepository: SyncRepository,
    private prisma: PrismaService,
  ) {}

  async initiateSync(params: {
    storeId?: string;
    regionId?: string;
    syncType: string;
    direction: SyncDirection;
  }): Promise<any> {
    const syncLog = await this.syncRepository.create({
      store: params.storeId ? { connect: { id: params.storeId } } : undefined,
      region: params.regionId ? { connect: { id: params.regionId } } : undefined,
      syncType: params.syncType,
      direction: params.direction,
      status: SyncStatus.PENDING,
      startedAt: new Date(),
    });

    // TODO: Implement actual sync logic
    // This would involve:
    // 1. Connecting to local store server
    // 2. Fetching data to sync
    // 3. Pushing to regional/global backend
    // 4. Updating sync status

    return syncLog;
  }

  async updateSyncStatus(
    syncId: string,
    status: SyncStatus,
    recordsSynced?: number,
    recordsFailed?: number,
    errorMessage?: string,
  ): Promise<void> {
    const duration = undefined; // Calculate duration
    await this.syncRepository.update(syncId, {
      status,
      recordsSynced,
      recordsFailed,
      errorMessage,
      completedAt: status === SyncStatus.COMPLETED || status === SyncStatus.FAILED ? new Date() : undefined,
      duration,
    });

    // Update store sync status if applicable
    // TODO: Update store's lastSyncAt and syncStatus
  }

  async findByStore(storeId: string, paginationDto: PaginationDto): Promise<PaginationResponseDto<any>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [syncLogs, total] = await Promise.all([
      this.syncRepository.findByStore(storeId, { skip, take: limit }),
      this.syncRepository.count({ storeId }),
    ]);

    return {
      data: syncLogs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAll(
    paginationDto: PaginationDto,
    filters?: { storeId?: string; regionId?: string; status?: string },
  ): Promise<PaginationResponseDto<any>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.storeId) where.storeId = filters.storeId;
    if (filters?.regionId) where.regionId = filters.regionId;
    if (filters?.status) where.status = filters.status;

    const [syncLogs, total] = await Promise.all([
      this.syncRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startedAt: 'desc' },
      }),
      this.syncRepository.count(where),
    ]);

    return {
      data: syncLogs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

