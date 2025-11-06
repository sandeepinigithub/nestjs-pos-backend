import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from '../services/categories.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { CategoryResponseDto } from '../dto/category-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Categories')
@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully', type: CategoryResponseDto })
  async create(@Body() createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully', type: [CategoryResponseDto] })
  async findAll(): Promise<CategoryResponseDto[]> {
    return this.categoriesService.findAll();
  }

  @Get('root')
  @ApiOperation({ summary: 'Get root categories (no parent)' })
  @ApiResponse({ status: 200, description: 'Root categories retrieved', type: [CategoryResponseDto] })
  async findRootCategories(): Promise<CategoryResponseDto[]> {
    return this.categoriesService.findRootCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully', type: CategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOne(@Param('id') id: string): Promise<CategoryResponseDto> {
    return this.categoriesService.findOne(id);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a category' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.categoriesService.remove(id);
  }
}

