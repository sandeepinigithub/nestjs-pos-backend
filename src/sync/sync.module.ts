import { Module } from '@nestjs/common';
import { SyncService } from './services/sync.service';
import { SyncController } from './controllers/sync.controller';
import { SyncRepository } from './repositories/sync.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SyncController],
  providers: [SyncService, SyncRepository],
  exports: [SyncService, SyncRepository],
})
export class SyncModule {}

