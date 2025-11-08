import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductsDto } from './dto/filter-products.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: createProductDto,
    });
  }

  async findAll(filterDto?: FilterProductsDto) {
    const where: any = {};

    if (filterDto?.search) {
      where.OR = [
        { name: { contains: filterDto.search, mode: 'insensitive' } },
        { description: { contains: filterDto.search, mode: 'insensitive' } },
      ];
    }

    if (filterDto?.category) {
      where.category = { contains: filterDto.category, mode: 'insensitive' };
    }

    if (filterDto?.minPrice !== undefined || filterDto?.maxPrice !== undefined) {
      where.price = {};
      if (filterDto.minPrice !== undefined) {
        where.price.gte = filterDto.minPrice;
      }
      if (filterDto.maxPrice !== undefined) {
        where.price.lte = filterDto.maxPrice;
      }
    }

    const page = filterDto?.page || 1;
    const limit = filterDto?.limit || 20;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await this.prisma.product.count({ where });

    // Get products sorted by category first, then by createdAt
    const products = await this.prisma.product.findMany({
      where,
      orderBy: [
        { category: 'asc' },  // Sort by category first
        { createdAt: 'desc' }, // Then by newest
      ],
      skip,
      take: limit,
    });

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.cartItem.deleteMany({
      where: { productId: id },
    });

    return this.prisma.product.delete({
      where: { id },
    });
  }
}

