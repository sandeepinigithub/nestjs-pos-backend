import { Module } from '@nestjs/common';
import { GroupsService } from './services/groups.service';
import { GroupsController } from './controllers/groups.controller';
import { GroupRepository } from './repositories/group.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GroupsController],
  providers: [GroupsService, GroupRepository],
  exports: [GroupsService, GroupRepository],
})
export class GroupsModule {}

