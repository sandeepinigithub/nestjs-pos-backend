import { Module } from '@nestjs/common';
import { CustomersService } from './services/customers.service';
import { CustomersController } from './controllers/customers.controller';
import { CustomerRepository } from './repositories/customer.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CustomersController],
  providers: [CustomersService, CustomerRepository],
  exports: [CustomersService, CustomerRepository],
})
export class LoyaltyModule {}

