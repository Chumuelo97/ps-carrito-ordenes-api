import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductoDto } from './producto.dto';

export class agregarProductosDto {
  @ApiProperty()
  @IsString()
  compradorId: string;
  @ApiProperty()
  @IsNumber()
  productoId: number;
  @ApiProperty()
  @IsNumber()
  cantidad: number;
}

export class CrearCarritoDto {
  @ApiProperty()
  @IsString()
  compradorId: string;
}

export class CarritoItemDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  @ValidateNested({ each: true })
  @Type(() => agregarProductosDto)
  compradorId: string;

  @ApiProperty()
  @IsNumber()
  productoId: number;

  @ApiProperty()
  @IsNumber()
  cantidad: number;

  @ApiProperty()
  @IsNumber()
  precio: number;

  @ApiProperty()
  @IsNumber()
  carritoId: number;

  @ApiProperty({ type: [ProductoDto] })
  @IsOptional()
  items: ProductoDto[];
}





/**
 * Representa un item del carrito con todos los detalles del producto.
 * Hereda las propiedades de ProductoDto y agrega las del carrito.
 
export class CarritoItemDetalladoDto extends ProductoDto {
  @ApiProperty({
    description: 'ID del item en el carrito',
    name: 'carritoItemId',
  })
  @IsNumber()
  carritoItemId: number; // Este id es el de CarritoItemEntity, renombramos para evitar conflicto.

  @ApiProperty({ description: 'ID del producto' })
  @IsNumber()
  productoId: number;
}*/