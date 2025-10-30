import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsArray, IsOptional } from 'class-validator';
import { ProductoDto } from './producto.dto';

export class CarritoItemDto {
  @ApiProperty()
  @IsNumber()
  productoId: number;

  @ApiProperty()
  @IsNumber()
  cantidad: number;

  @ApiProperty()
  @IsNumber()
  precio: number;
}

export class CreateCarritoDto {
  @ApiProperty()
  @IsString()
  compradorId: string;

  @ApiProperty({ type: [CarritoItemDto] })
  @IsOptional()
  items: CarritoItemDto[];
}

export class agregarProductosAlCarritoDto {
  @ApiProperty()
  @IsNumber()
  productoId: number;

  @ApiProperty()
  @IsNumber()
  cantidad: number;

  @ApiProperty()
  @IsString()
  compradorId: string;
}

export class EliminarProductoDto {
  @ApiProperty()
  @IsString()
  compradorId: string;

  @ApiProperty()
  @IsNumber()
  productoId: number;
}

export class CrearCarritoSimuladoDto {
  @ApiProperty()
  @IsString()
  compradorId: string;

  @ApiProperty({
    description: 'Lista de IDs de productos para agregar al carrito simulado',
    type: [Number],
  })
  @IsArray()
  productoIds: number[];
}

/**
 * ---- ¡NUEVO DTO! ----
 * Representa un item del carrito con todos los detalles del producto.
 * Hereda las propiedades de ProductoDto y agrega las del carrito.
 */
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
}

/**
 * ---- ¡NUEVO DTO! ----
 * Representa la respuesta completa y detallada del carrito.
 */
export class CarritoDetalladoDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  compradorId: string;

  @ApiProperty()
  total: number;

  @ApiProperty({ type: [CarritoItemDetalladoDto] })
  items: CarritoItemDetalladoDto[];
}
