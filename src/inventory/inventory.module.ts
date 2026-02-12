import { Module } from '@nestjs/common';
import { InventoryService } from './services/inventory.service';
import { InventoryDashboardService } from './services/inventory-dashboard.service';
import { AdjustmentsService } from './services/adjustments.service';
import { InventoryController } from './controllers/inventory.controller';
import { AdjustmentsController } from './controllers/adjustments.controller';
import { InventoryRepository } from './repositories/inventory.repository';
import { AdjustmentRepository } from './repositories/adjustment.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InventoryController, AdjustmentsController],
  providers: [
    InventoryService,
    InventoryDashboardService,
    AdjustmentsService,
    InventoryRepository,
    AdjustmentRepository,
  ],
  exports: [
    InventoryService,
    InventoryDashboardService,
    AdjustmentsService,
    InventoryRepository,
    AdjustmentRepository,
  ],
})
export class InventoryModule {}

