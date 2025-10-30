export class ProductoDto {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number; // Stock disponible
  category: string;
  imageUrl: string;
}
