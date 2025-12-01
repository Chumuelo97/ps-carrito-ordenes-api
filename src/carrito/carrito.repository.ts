import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarritoEntity } from './entities/carrito.entity';

@Injectable()
export class CarritoRepository {
  constructor(
    @InjectRepository(CarritoEntity)
    private readonly repo: Repository<CarritoEntity>,
  ) {}

  /**
   * Obtener carrito con items ya parseados.
   * Valida que el carrito pertenezca al comprador si se pasa compradorId.
   */
  async obtenerCarritoCompleto(carritoId: number, compradorId?: string) {
    const carrito = await this.repo.findOne({ where: { id: carritoId } });

    if (!carrito) return null;
    if (compradorId && String(carrito.compradorId) !== String(compradorId)) {
      // No pertenece
      return null;
    }

    // asumimos que items se guardan como simple-json en la entidad carrito
    const items = carrito.items ?? [];
    // items: Array<{ productoId:number, cantidad:number, precio:number }>
    return {
      ...carrito,
      items,
    };
  }

  /**
   * Vaciar carrito (usar dentro de transacción si se pasa manager)
   */
  async vaciarCarrito(carritoId: number, manager?: any) {
    if (manager) {
      const repo = manager.getRepository(CarritoEntity);
      const carrito = await repo.findOne({ where: { id: carritoId } });
      if (!carrito) throw new NotFoundException('Carrito no encontrado');
      carrito.items = [];
      carrito.total = 0;
      return await repo.save(carrito);
    } else {
      const carrito = await this.repo.findOne({ where: { id: carritoId } });
      if (!carrito) throw new NotFoundException('Carrito no encontrado');
      carrito.items = [];
      carrito.total = 0;
      return await this.repo.save(carrito);
    }
  }
}
