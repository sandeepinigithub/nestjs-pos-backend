import { Module } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { OrdersController } from './controllers/orders.controller';
import { OrderRepository } from './repositories/order.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrderRepository],
  exports: [OrdersService, OrderRepository],
})
export class OrdersModule {}

