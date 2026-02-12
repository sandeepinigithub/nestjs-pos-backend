import { Module } from '@nestjs/common';
import { PurchaseDashboardService } from './services/purchase-dashboard.service';
import { VendorsService } from './services/vendors.service';
import { PurchaseOrdersService } from './services/purchase-orders.service';
import { PurchasesController } from './controllers/purchases.controller';
import { VendorsController } from './controllers/vendors.controller';
import { PurchaseOrdersController } from './controllers/purchase-orders.controller';
import { PurchaseRepository } from './repositories/purchase.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PurchasesController, VendorsController, PurchaseOrdersController],
  providers: [PurchaseDashboardService, VendorsService, PurchaseOrdersService, PurchaseRepository],
  exports: [PurchaseDashboardService, VendorsService, PurchaseOrdersService, PurchaseRepository],
})
export class PurchasesModule {}
