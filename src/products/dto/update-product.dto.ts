import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

/**
 * Update DTO - all fields optional.
 */
export class UpdateProductDto extends PartialType(CreateProductDto) {}
