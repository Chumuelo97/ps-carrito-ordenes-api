import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsArray,
  IsOptional,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductoDto } from './producto.dto';
export class agregarProductosDto {
  @ApiProperty()
  @IsString()
  compradorId: string;

  @ApiProperty({ description: 'ID del producto (opcional si se usa sku)' })
  @IsOptional()
  @IsNumber()
  productoId?: number;

  @ApiProperty({
    description: 'SKU del producto (opcional si se usa productoId)',
  })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty()
  @IsNumber()
  cantidad: number;
}

// NUEVO: agregar por SKU explícito
export class AgregarProductoSkuDto {
  @ApiProperty()
  @IsString()
  compradorId: string;

  @ApiProperty({ description: 'SKU del producto a agregar' })
  @IsString()
  sku: string;

  @ApiProperty()
  @IsNumber()
  cantidad: number;
}

// DTOs para operaciones de eliminación
export class EliminarProductoDto {
  @ApiProperty({ description: 'Identificador del comprador' })
  @IsString()
  compradorId: string;

  @ApiProperty({
    description: 'Identificador del producto a eliminar',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  productoId?: number;

  @ApiProperty({ description: 'SKU del producto a eliminar', required: false })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty()
  @IsNumber()
  cantidad: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  carritoId?: number;
}

// NUEVO: actualizar cantidad (PUT/PATCH)
export class ActualizarCantidadDto {
  @ApiProperty()
  @IsString()
  compradorId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  productoId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({ description: 'Nueva cantidad a establecer' })
  @IsNumber()
  cantidad: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  carritoId?: number;
}

// carrito DTO
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

  // NUEVO: campos enriquecidos
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

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

export class EliminarCarritoDto {
  @ApiProperty({
    description: 'Identificador del comprador cuyo carrito se eliminará',
  })
  @IsString()
  compradorId: string;

  @ApiProperty({
    description: 'Identificador del carrito (opcional)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  carritoId: number;
}

export class CarritoDetalladoDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  compradorId: string;

  @ApiProperty()
  @IsNumber()
  total: number;

  @ApiProperty({ type: [ProductoDto] })
  @IsOptional()
  items: ProductoDto[];
}