import { Module } from '@nestjs/common';
import { SalesDashboardService } from './services/sales-dashboard.service';
import { PosOperationsService } from './services/pos-operations.service';
import { SalesController } from './controllers/sales.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SalesController],
  providers: [SalesDashboardService, PosOperationsService],
  exports: [SalesDashboardService, PosOperationsService],
})
export class SalesModule {}
