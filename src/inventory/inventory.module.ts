import { Module } from '@nestjs/common';
import { InventoryService } from './services/inventory.service';
import { InventoryDashboardService } from './services/inventory-dashboard.service';
import { InventoryController } from './controllers/inventory.controller';
import { InventoryRepository } from './repositories/inventory.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InventoryController],
  providers: [InventoryService, InventoryDashboardService, InventoryRepository],
  exports: [InventoryService, InventoryDashboardService, InventoryRepository],
})
export class InventoryModule {}

