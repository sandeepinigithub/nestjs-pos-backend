import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CategoryRepository } from '../repositories/category.repository';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { CategoryResponseDto } from '../dto/category-response.dto';

@Injectable()
export class CategoriesService {
  constructor(private categoryRepository: CategoryRepository) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    // Check if code already exists
    const existingCategory = await this.categoryRepository.findByCode(createCategoryDto.code);
    if (existingCategory) {
      throw new ConflictException('Category with this code already exists');
    }

    // Validate parent if provided
    if (createCategoryDto.parentId) {
      const parent = await this.categoryRepository.findById(createCategoryDto.parentId);
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    const category = await this.categoryRepository.create({
      code: createCategoryDto.code,
      name: createCategoryDto.name,
      description: createCategoryDto.description,
      parent: createCategoryDto.parentId
        ? { connect: { id: createCategoryDto.parentId } }
        : undefined,
      image: createCategoryDto.image,
      displayOrder: createCategoryDto.displayOrder ?? 0,
      isActive: true,
    });

    return new CategoryResponseDto(category);
  }

  async findAll(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.findMany({
      include: {
        parent: true,
        children: true,
      },
      orderBy: { displayOrder: 'asc' },
    });

    return categories.map((category) => new CategoryResponseDto(category));
  }

  async findRootCategories(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.findRootCategories();
    return categories.map((category) => new CategoryResponseDto(category));
  }

  async findOne(id: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Type assertion to include children if needed
    const categoryWithChildren = category as typeof category & { children?: any[] };
    return new CategoryResponseDto(categoryWithChildren);
  }

  async remove(id: string): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check if category has children
    const categoryWithChildren = category as typeof category & { children?: any[] };
    if (categoryWithChildren.children && categoryWithChildren.children.length > 0) {
      throw new BadRequestException('Cannot delete category with children. Please delete or reassign children first.');
    }

    await this.categoryRepository.delete(id);
  }
}

