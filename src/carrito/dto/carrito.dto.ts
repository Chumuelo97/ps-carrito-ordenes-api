import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductoDto } from './producto.dto';
// Productos DTO 
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
// DTOs para operaciones de eliminación
export class EliminarProductoDto {
  @ApiProperty({ description: 'Identificador del comprador' })
  @IsString()
  compradorId: string;

  @ApiProperty({ description: 'Identificador del producto a eliminar' })
  @IsNumber()
  productoId: number;

  @ApiProperty()
  @IsNumber()
  cantidad: number;
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