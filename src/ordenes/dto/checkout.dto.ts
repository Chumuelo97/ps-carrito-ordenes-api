import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CheckoutItemDto {
  @IsNumber()
  productoId: number;

  @IsNumber()
  cantidad: number;
}

export class CheckoutDto {
  @IsString()
  @IsOptional()
  compradorId?: string; // opcional si usas autenticación

  @IsString()
  @IsNotEmpty()
  direccionEnvio: string;

  @IsNumber()
  total: number;

  @IsArray()
  @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[];
}
