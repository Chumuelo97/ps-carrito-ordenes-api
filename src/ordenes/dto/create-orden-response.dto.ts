// src/ordenes/dto/create-orden-response.dto.ts
export class OrdenItemResponseDto {
  productoId: number;
  cantidad: number;
  precio: number;
  subtotal: number;
}

export class CreateOrdenResponseDto {
  id: number;
  total: number;
  estadoPago: string;
  fecha: Date;
  items?: OrdenItemResponseDto[];
}
