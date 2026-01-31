import { Module } from '@nestjs/common';
import { BOGOService } from './services/bogo.service';
import { BOGOController } from './controllers/bogo.controller';
import { BOGORepository } from './repositories/bogo.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BOGOController],
  providers: [BOGOService, BOGORepository],
  exports: [BOGOService, BOGORepository],
})
export class BOGOModule {}
