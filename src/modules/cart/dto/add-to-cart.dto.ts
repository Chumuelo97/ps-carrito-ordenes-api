import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsPositive, IsOptional } from 'class-validator';

export class AddToCartDto {
  // Accept productId (UUID) or id_producto (number)
  @Transform(({ obj, value }) => obj.productId ?? obj.id_producto ?? value)
  @IsNotEmpty({ message: 'El productId/id_producto no puede estar vacío.' })
  productId: string | number;

  // Accept quantity or cantidad and coerce to number
  @Transform(({ obj, value }) => {
    const v = obj.quantity ?? obj.cantidad ?? value;
    if (v === undefined || v === null) return v;
    return typeof v === 'string' ? Number(v) : v;
  })
  @IsNumber({}, { message: 'La cantidad debe ser un número.' })
  @IsPositive({ message: 'La cantidad debe ser un número positivo.' })
  quantity: number;

  // Accept userId (UUID) or id_usuario (number)
  @Transform(({ obj, value }) => obj.userId ?? obj.user_id ?? obj.id_usuario ?? value)
  @IsNotEmpty({ message: 'El userId/id_usuario no puede estar vacío.' })
  userId: string | number;

  // Alias opcionales para permitir claves en español cuando 'forbidNonWhitelisted' está activo
  @IsOptional()
  id_producto?: any;

  @IsOptional()
  cantidad?: any;

  @IsOptional()
  id_usuario?: any;
}
