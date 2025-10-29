import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsArray, IsOptional } from 'class-validator';

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
