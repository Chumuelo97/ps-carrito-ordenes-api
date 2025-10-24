import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdenEntity } from './entities/orden.entity';
import { CarritoService } from '../carrito/carrito.service';

@Injectable()
export class OrdenesService {
  constructor(
    @InjectRepository(OrdenEntity)
    private ordenesRepository: Repository<OrdenEntity>,
    private carritoService: CarritoService,
  ) {}

  // HU4: Realizar checkout y crear orden de compra
  async crearOrden(carritoId: string): Promise<OrdenEntity> {
    const carrito = await this.carritoService.findOne(Number(carritoId));

    if (!carrito) {
      throw new Error('Carrito no encontrado');
    }

    const orden = this.ordenesRepository.create({
      carrito,
      carritoId,
      compradorId: carrito.compradorId,
      total: carrito.total,
      estadoPago: 'PENDIENTE',
    });

    return this.ordenesRepository.save(orden);
  }

  // HU4: Informar estado de pago de un carro
  async obtenerEstadoPago(carritoId: string) {
    const orden = await this.ordenesRepository.findOne({
      where: { carritoId },
    });
    return orden ? orden.estadoPago : 'NO_EXISTE';
  }

  // HU5: Obtener historial de órdenes por comprador
  async obtenerHistorialComprador(compradorId: string) {
    return this.ordenesRepository.find({
      where: { compradorId },
      relations: ['carrito'],
      order: { fechaCreacion: 'DESC' },
    });
  }

  // Estadísticas de producto
  async obtenerEstadisticasProducto(productoId: string) {
    const result = await this.ordenesRepository
      .createQueryBuilder('orden')
      .leftJoin('orden.carrito', 'carrito')
      .leftJoin('carrito.items', 'items')
      .where('items.productoId = :productoId', { productoId })
      .select([
        'COUNT(DISTINCT CASE WHEN orden.estadoPago = :pagado THEN orden.id END) as comprados',
        'COUNT(DISTINCT CASE WHEN orden.estadoPago = :cancelado THEN orden.id END) as cancelados',
        'COUNT(DISTINCT CASE WHEN carrito.estado = :completado THEN carrito.id END) as carritosCompletados',
        'COUNT(DISTINCT CASE WHEN carrito.estado = :abandonado THEN carrito.id END) as carritosAbandonados',
      ])
      .setParameters({
        pagado: 'PAGADO',
        cancelado: 'CANCELADO',
        completado: 'COMPLETADO',
        abandonado: 'ABANDONADO',
      })
      .getRawOne();

    return {
      vecesComprado: parseInt(result.comprados) || 0,
      vecesCancelado: parseInt(result.cancelados) || 0,
      carritosCompletados: parseInt(result.carritosCompletados) || 0,
      carritosAbandonados: parseInt(result.carritosAbandonados) || 0,
    };
  }
}
