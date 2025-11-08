import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 15 Pro' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Latest iPhone with A17 Pro chip' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 89990, minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 50000, minimum: 0 })
  @IsNumber()
  @Min(0)
  costPrice: number;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 'Smartphones' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 25, minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;
}

