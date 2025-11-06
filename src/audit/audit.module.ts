import { Module } from '@nestjs/common';
import { AuditService } from './services/audit.service';
import { AuditController } from './controllers/audit.controller';
import { AuditRepository } from './repositories/audit.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AuditController],
  providers: [AuditService, AuditRepository],
  exports: [AuditService, AuditRepository],
})
export class AuditModule {}

