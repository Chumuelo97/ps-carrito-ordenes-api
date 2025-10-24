import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdenEntity } from './entities/orden.entity';
import { CarritoService } from '../carrito/carrito.service';
import { CarritoEntity } from 'src/carrito/entities/carrito.entity';

@Injectable()
export class OrdenesService {
  constructor(
    /*@InjectRepository(OrdenEntity)
    private ordenesRepository: Repository<OrdenEntity>,
    private carritoService: CarritoService,*/
    @InjectRepository(OrdenEntity)
    private ordenesRepository: Repository<OrdenEntity>,
    @InjectRepository(CarritoEntity)
    private carritoRepository: Repository<CarritoEntity>,
  ) {}

  // HU4: Realizar checkout y crear orden de compra
  async crearOrden(carritoId: string): Promise<OrdenEntity> {
    try {
      // Convertir el carritoId a número y buscar el carrito
      //const carrito = await this.carritoService.findOne(Number(carritoId));

      // Buscar el carrito directamente en la base de datos
      const carrito = await this.carritoRepository.findOne({
        where: { id: Number(carritoId) },
      });

      if (!carrito) {
        throw new Error('Carrito no encontrado');
      }

      // Crear la nueva orden con los datos proporcionados
      const orden = this.ordenesRepository.create({
        carritoId: Number(carritoId), // String como en tu JSON
        compradorId: carrito.compradorId, // Valor fijo como en tu JSON
        total: carrito.total, // Número como en tu JSON
        estadoPago: 'PENDIENTE', // Estado inicial
      });

      // Guardar la orden en la base de datos
      return await this.ordenesRepository.save(orden);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al crear la orden: ${error.message}`,
      );
    }
  }

  // HU4: Informar estado de pago de un carro
  /*async obtenerEstadoPago(compradorId: string): Promise<string> {
    // Buscar la orden más reciente del comprador y retornar su estado de pago
    const orden = await this.ordenesRepository.findOne({
      where: { compradorId },
      relations: ['carrito'],
      order: { fechaCreacion: 'DESC' },
    });

    return orden ? orden.estadoPago : 'NO_EXISTE';
  }<----- arreglar este método*/
  async obtenerEstadoPago(carritoId: string): Promise<string> {
    const orden = await this.ordenesRepository.findOne({
      where: { carritoId: Number(carritoId) },
    });
    return orden ? orden.estadoPago : 'NO_EXISTE';
  }
  // HU5: Obtener historial de órdenes por comprador
  /*async obtenerHistorialComprador(compradorId: string) {
    return this.ordenesRepository.find({
      where: { compradorId },
      //relations: ['carrito'],
      order: { fechaCreacion: 'DESC' },
    });
  }*/
  async obtenerHistorialComprador(compradorId: string): Promise<OrdenEntity[]> {
    try {
      console.log('Buscando órdenes para el comprador:', compradorId);

      const ordenes = await this.ordenesRepository.find({
        where: { compradorId },
        order: {
          fechaCreacion: 'DESC',
        },
        // Removemos la relación con carrito por ahora
      });

      if (!ordenes || ordenes.length === 0) {
        throw new NotFoundException(
          `No se encontraron órdenes para el comprador ${compradorId}`,
        );
      }

      return ordenes;
    } catch (error) {
      console.error('Error al obtener historial:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al obtener el historial de órdenes: ${error.message}`,
      );
    }
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
