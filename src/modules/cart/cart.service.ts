import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
  @InjectRepository(Order)
  private readonly cartRepo: Repository<Order>,
  @InjectRepository(OrderItem)
  private readonly itemRepo: Repository<OrderItem>,
  ) {}

  async addItemToCart(addToCartDto: AddToCartDto): Promise<Order | null> {
    const { userId, productId, quantity } = addToCartDto as any;

    // Obtener info de producto (mock)
    const product = await this.findProductById(productId);
    if (!product) {
      throw new NotFoundException(`Producto con ID ${productId} no encontrado.`);
    }

    // Buscar o crear carrito del usuario
    // Buscar orden (actuará como carrito persistido) por id_usuario
    let order = await this.cartRepo.findOne({ where: { id_usuario: Number(userId) } });
    if (!order) {
      order = this.cartRepo.create({ id_usuario: Number(userId), estado: 'pending', monto_final: 0, items: [] });
      order = await this.cartRepo.save(order);
    }

    // Buscar si item ya existe en la base (por cart.id y productId)
    // Buscar si item ya existe por id_order y id_producto
    let existing = await this.itemRepo.findOne({ where: { id_order: order.id, id_producto: Number(productId) } });
    if (existing) {
      existing.cantidad += Number(quantity);
      existing.precio = product.price;
      await this.itemRepo.save(existing);
    } else {
      const newItem = this.itemRepo.create({ id_order: order.id, id_producto: Number(productId), cantidad: Number(quantity), precio: product.price });
      await this.itemRepo.save(newItem);
    }

    // Recalcular monto_final y guardar orden
    const refreshed = await this.cartRepo.findOne({ where: { id: order.id } });
    if (refreshed) {
      const total = (refreshed.items || []).reduce((s, it: any) => s + Number(it.precio) * Number(it.cantidad), 0);
      refreshed.monto_final = Number(total.toFixed(2));
      await this.cartRepo.save(refreshed);
      this.logger.log(`Orden persistida para usuario ${userId} con monto_final=${refreshed.monto_final}`);
      return refreshed;
    }

    return null;
  }

  async getCartByUserId(userId: string): Promise<Order | null> {
    const order = await this.cartRepo.findOne({ where: { id_usuario: Number(userId) } });
    return order;
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await this.cartRepo.findOne({ where: { id_usuario: Number(userId) } });
    if (cart) {
      await this.cartRepo.remove(cart);
      this.logger.log(`Carrito eliminado para usuario ${userId}`);
    }
  }

  private async findProductById(
    productId: string | number,
  ): Promise<{ id: string | number; name: string; price: number; stock: number } | null> {
    const fakeProducts: Record<string, { id: string | number; name: string; price: number; stock: number }> = {
      'a1b2c3d4-e5f6-7890-1234-567890abcdef': { id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', name: 'Laptop Pro', price: 1200.5, stock: 10 },
      'b2c3d4e5-f6a7-8901-2345-67890abcdef1': { id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1', name: 'Mouse Inalámbrico', price: 25.0, stock: 50 },
      '1': { id: 1, name: 'Laptop Pro', price: 1200.5, stock: 10 },
      '2': { id: 2, name: 'Mouse Inalámbrico', price: 25.0, stock: 50 },
    };

    const key = String(productId);
    return fakeProducts[key] || null;
  }
}
