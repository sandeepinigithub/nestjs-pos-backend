import { Module } from '@nestjs/common';
import { CategoriesService } from './services/categories.service';
import { CategoriesController } from './controllers/categories.controller';
import { CategoryRepository } from './repositories/category.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoryRepository],
  exports: [CategoriesService, CategoryRepository],
})
export class CategoriesModule {}

