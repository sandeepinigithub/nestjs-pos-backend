import { Module } from '@nestjs/common';
import { StoresService } from './services/stores.service';
import { StoresController } from './controllers/stores.controller';
import { StoreRepository } from './repositories/store.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StoresController],
  providers: [StoresService, StoreRepository],
  exports: [StoresService, StoreRepository],
})
export class StoresModule {}

