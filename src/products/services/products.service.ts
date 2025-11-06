import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { PaginationDto, PaginationResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(private productRepository: ProductRepository) {}

  async create(createProductDto: CreateProductDto, currentUser?: UserResponseDto): Promise<ProductResponseDto> {
    // Check if product code already exists
    const existingProduct = await this.productRepository.findByCode(createProductDto.code);
    if (existingProduct) {
      throw new ConflictException('Product with this code already exists');
    }

    const product = await this.productRepository.create({
      code: createProductDto.code,
      name: createProductDto.name,
      description: createProductDto.description,
      category: { connect: { id: createProductDto.categoryId } },
      image: createProductDto.image,
      status: createProductDto.status || 'ACTIVE',
      basePrice: createProductDto.basePrice,
      costPrice: createProductDto.costPrice,
      attributes: createProductDto.attributes,
      tags: createProductDto.tags,
      isAvailable: createProductDto.isAvailable ?? true,
      ...(currentUser?.id ? { createdBy: currentUser.id } : {}),
    });

    return new ProductResponseDto(product);
  }

  async findAll(
    paginationDto: PaginationDto,
    filters?: { categoryId?: string; status?: string; isAvailable?: boolean },
  ): Promise<PaginationResponseDto<ProductResponseDto>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.status) where.status = filters.status;
    if (filters?.isAvailable !== undefined) where.isAvailable = filters.isAvailable;

    const [products, total] = await Promise.all([
      this.productRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
        },
      }),
      this.productRepository.count(where),
    ]);

    return {
      data: products.map((product) => new ProductResponseDto(product)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return new ProductResponseDto(product);
  }

  async findByCategory(categoryId: string): Promise<ProductResponseDto[]> {
    const products = await this.productRepository.findByCategory(categoryId);
    return products.map((product) => new ProductResponseDto(product));
  }
}

