import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CustomerRepository } from '../repositories/customer.repository';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { CustomerResponseDto } from '../dto/customer-response.dto';
import { PaginationDto, PaginationResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class CustomersService {
  constructor(private customerRepository: CustomerRepository) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<CustomerResponseDto> {
    // Check if email already exists
    if (createCustomerDto.email) {
      const existingCustomer = await this.customerRepository.findByEmail(createCustomerDto.email);
      if (existingCustomer) {
        throw new ConflictException('Customer with this email already exists');
      }
    }

    // Check if phone already exists
    if (createCustomerDto.phone) {
      const existingCustomer = await this.customerRepository.findByPhone(createCustomerDto.phone);
      if (existingCustomer) {
        throw new ConflictException('Customer with this phone already exists');
      }
    }

    // Generate customer number
    const customerNumber = await this.customerRepository.generateCustomerNumber();

    const customer = await this.customerRepository.create({
      customerNumber,
      firstName: createCustomerDto.firstName,
      lastName: createCustomerDto.lastName,
      email: createCustomerDto.email,
      phone: createCustomerDto.phone,
      address: createCustomerDto.address,
      city: createCustomerDto.city,
      state: createCustomerDto.state,
      postalCode: createCustomerDto.postalCode,
      country: createCustomerDto.country,
      preferences: createCustomerDto.preferences,
      loyaltyPoints: 0,
      isActive: true,
    });

    return new CustomerResponseDto(customer);
  }

  async findAll(
    paginationDto: PaginationDto,
    filters?: { search?: string },
  ): Promise<PaginationResponseDto<CustomerResponseDto>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
        { customerNumber: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      this.customerRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.customerRepository.count(where),
    ]);

    return {
      data: customers.map((customer) => new CustomerResponseDto(customer)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<CustomerResponseDto> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return new CustomerResponseDto(customer);
  }

  async findByEmail(email: string): Promise<CustomerResponseDto | null> {
    const customer = await this.customerRepository.findByEmail(email);
    return customer ? new CustomerResponseDto(customer) : null;
  }

  async findByPhone(phone: string): Promise<CustomerResponseDto | null> {
    const customer = await this.customerRepository.findByPhone(phone);
    return customer ? new CustomerResponseDto(customer) : null;
  }
}

