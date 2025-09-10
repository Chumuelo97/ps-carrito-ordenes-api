// Clase para representar un ítem dentro del carrito
export class CartItem {
  productId: string;
  quantity: number;
  price: number; // Precio del producto al momento de ser agregado
}

// Clase que representa el Agregado Raíz del Carrito
export class Cart {
  id: string; // ID del carrito
  userId: string; // ID del usuario al que pertenece el carrito
  items: CartItem[] = []; // Lista de ítems en el carrito
  status: 'active' | 'ordered' = 'active';

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Agrega o actualiza un ítem en el carrito.
   * La lógica de negocio vive dentro del agregado para garantizar consistencia.
   */
  addItem(productId: string, quantity: number, price: number): void {
    const existingItemIndex = this.items.findIndex(
      (item) => item.productId === productId,
    );

    if (existingItemIndex > -1) {
      // Si el ítem ya existe, actualiza la cantidad
      this.items[existingItemIndex].quantity += quantity;
    } else {
      // Si es un ítem nuevo, lo agrega a la lista
      this.items.push({ productId, quantity, price });
    }
  }

  /**
   * Calcula el total del carrito.
   */
  calculateTotal(): number {
    return this.items.reduce(
      (total, item) => total + item.quantity * item.price,
      0,
    );
  }
}
