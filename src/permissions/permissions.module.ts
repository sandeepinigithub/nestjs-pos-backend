import { Module } from '@nestjs/common';
import { PermissionsService } from './services/permissions.service';
import { PermissionsController } from './controllers/permissions.controller';
import { PermissionRepository } from './repositories/permission.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PermissionsController],
  providers: [PermissionsService, PermissionRepository],
  exports: [PermissionsService, PermissionRepository],
})
export class PermissionsModule {}

