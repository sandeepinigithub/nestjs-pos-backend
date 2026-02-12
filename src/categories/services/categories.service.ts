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
    const code = await this.resolveCode(createCategoryDto);

    const existingCategory = await this.categoryRepository.findByCode(code);
    if (existingCategory) {
      throw new ConflictException('Category with this code already exists');
    }

    if (createCategoryDto.parentId) {
      const parent = await this.categoryRepository.findById(createCategoryDto.parentId);
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    const category = await this.categoryRepository.create({
      code,
      name: createCategoryDto.name,
      description: createCategoryDto.description,
      parent: createCategoryDto.parentId
        ? { connect: { id: createCategoryDto.parentId } }
        : undefined,
      image: createCategoryDto.image,
      displayOrder: createCategoryDto.displayOrder ?? 0,
      isActive: createCategoryDto.isActive ?? true,
    });

    return new CategoryResponseDto(category);
  }

  /** Generate a unique code from name when code is not provided. */
  private async resolveCode(dto: CreateCategoryDto): Promise<string> {
    const raw = (dto.code ?? '').trim();
    if (raw.length >= 2) return raw.substring(0, 50);

    const base = dto.name
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .toUpperCase()
      .substring(0, 50) || 'CAT';
    let code = base;
    let suffix = 0;
    while (await this.categoryRepository.findByCode(code)) {
      code = `${base.substring(0, 47)}_${String(++suffix).padStart(2, '0')}`;
    }
    return code;
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

