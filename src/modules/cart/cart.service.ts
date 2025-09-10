import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { Cart } from './entities/cart.entity';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  // En una aplicación real, esto sería reemplazado por una base de datos (ej: MongoDB, PostgreSQL).
  // Usamos un Map para simular el almacenamiento de carritos por userId.
  private carts: Map<string, Cart> = new Map();

  async addItemToCart(addToCartDto: AddToCartDto): Promise<Cart> {
    const { userId, productId, quantity } = addToCartDto;

    // --- PASO 1: Simular llamada a otro microservicio (Productos) ---
    // En un caso real: const product = await this.productServiceClient.getProduct(productId);
    const product = await this.findProductById(productId);

    if (!product) {
      throw new NotFoundException(
        `Producto con ID ${productId} no encontrado.`,
      );
    }

    // --- PASO 2: Obtener o crear el carrito (lógica del agregado) ---
    // En un caso real: const cart = await this.cartRepository.findByUserId(userId);
    let userCart = this.carts.get(userId);

    if (!userCart) {
      this.logger.log(
        `No se encontró carrito para el usuario ${userId}. Creando uno nuevo.`,
      );
      userCart = new Cart(userId);
    }

    // --- PASO 3: Usar el método del agregado para añadir el ítem ---
    userCart.addItem(productId, quantity, product.price);

    // --- PASO 4: Guardar el estado del carrito ---
    // En un caso real: await this.cartRepository.save(userCart);
    this.carts.set(userId, userCart);
    this.logger.log(
      `Carrito actualizado para el usuario ${userId}: ${JSON.stringify(userCart)}`,
    );

    return userCart;
  }

  /**
   * @private
   * MOCK: Esta función simula la llamada a un microservicio de productos.
   * Devuelve datos de un producto falso para la prueba.
   */
  private async findProductById(
    productId: string,
  ): Promise<{ id: string; name: string; price: number; stock: number }> {
    const fakeProducts = {
      'a1b2c3d4-e5f6-7890-1234-567890abcdef': {
        id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        name: 'Laptop Pro',
        price: 1200.5,
        stock: 10,
      },
      'b2c3d4e5-f6a7-8901-2345-67890abcdef1': {
        id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1',
        name: 'Mouse Inalámbrico',
        price: 25.0,
        stock: 50,
      },
    };

    return fakeProducts[productId] || null;
  }
}
