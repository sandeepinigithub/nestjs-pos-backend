import { Module } from '@nestjs/common';
import { PurchaseDashboardService } from './services/purchase-dashboard.service';
import { PurchasesController } from './controllers/purchases.controller';
import { PurchaseRepository } from './repositories/purchase.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PurchasesController],
  providers: [PurchaseDashboardService, PurchaseRepository],
  exports: [PurchaseDashboardService, PurchaseRepository],
})
export class PurchasesModule {}
