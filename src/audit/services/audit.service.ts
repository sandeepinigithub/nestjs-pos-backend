import { Injectable } from '@nestjs/common';
import { AuditRepository } from '../repositories/audit.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditAction } from '@prisma/client';
import { PaginationDto, PaginationResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class AuditService {
  constructor(
    private auditRepository: AuditRepository,
    private prisma: PrismaService,
  ) {}

  async log(params: {
    userId?: string;
    storeId?: string;
    action: AuditAction;
    resource: string;
    resourceId?: string;
    oldValues?: any;
    newValues?: any;
    changes?: any;
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
    metadata?: any;
  }): Promise<void> {
    await this.auditRepository.create({
      user: params.userId ? { connect: { id: params.userId } } : undefined,
      store: params.storeId ? { connect: { id: params.storeId } } : undefined,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      oldValues: params.oldValues,
      newValues: params.newValues,
      changes: params.changes,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      requestId: params.requestId,
      metadata: params.metadata,
    });
  }

  async findAll(
    paginationDto: PaginationDto,
    filters?: { userId?: string; storeId?: string; action?: string; resource?: string },
  ): Promise<PaginationResponseDto<any>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.storeId) where.storeId = filters.storeId;
    if (filters?.action) where.action = filters.action;
    if (filters?.resource) where.resource = filters.resource;

    const [logs, total] = await Promise.all([
      this.auditRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.auditRepository.count(where),
    ]);

    return {
      data: logs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByUser(userId: string, paginationDto: PaginationDto): Promise<PaginationResponseDto<any>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.auditRepository.findByUser(userId, { skip, take: limit }),
      this.auditRepository.count({ userId }),
    ]);

    return {
      data: logs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByResource(resource: string, resourceId: string): Promise<any[]> {
    return this.auditRepository.findByResource(resource, resourceId);
  }
}

