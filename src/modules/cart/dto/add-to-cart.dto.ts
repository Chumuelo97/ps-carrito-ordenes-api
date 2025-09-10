import { IsNotEmpty, IsNumber, IsPositive, IsUUID } from 'class-validator';

export class AddToCartDto {
  @IsUUID()
  @IsNotEmpty({ message: 'El productId no puede estar vacío.' })
  productId: string;

  @IsNumber({}, { message: 'La cantidad debe ser un número.' })
  @IsPositive({ message: 'La cantidad debe ser un número positivo.' })
  quantity: number;

  @IsUUID()
  @IsNotEmpty({ message: 'El userId no puede estar vacío.' })
  userId: string;
}
