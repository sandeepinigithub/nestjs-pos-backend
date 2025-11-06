import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async checkDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      return false;
    }
  }

  async getHealthStatus() {
    const database = await this.checkDatabase();

    return {
      status: database ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: database ? 'up' : 'down',
      },
    };
  }
}

