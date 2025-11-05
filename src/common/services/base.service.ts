import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

/**
 * Base service with common functionality for all services
 * Provides transaction support and common utilities
 */
export abstract class BaseService {
  constructor(protected prisma: PrismaService) {}

  /**
   * Execute operations within a transaction
   */
  protected async transaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(callback);
  }

  /**
   * Execute multiple operations in parallel
   */
  protected async parallel<T>(promises: Promise<T>[]): Promise<T[]> {
    return Promise.all(promises);
  }
}

