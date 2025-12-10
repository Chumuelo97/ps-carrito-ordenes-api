import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { OrdenEntity } from './entities/orden.entity';
import { CarritoService } from '../carrito/carrito.service';
import { CarritoEntity } from 'src/carrito/entities/carrito.entity';

@Injectable()
export class OrdenesService {
  constructor(
    @InjectRepository(OrdenEntity)
    private ordenesRepository: Repository<OrdenEntity>,
    @InjectRepository(CarritoEntity)
    private carritoRepository: Repository<CarritoEntity>,
    private dataSource: DataSource,
  ) {}

  // HU4: Realizar checkout y crear orden de compra (transaccional)
  async crearOrden(carritoId: string): Promise<{
    orden: OrdenEntity;
    items: any[];
    total: number;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Buscar el carrito
      const carrito = await queryRunner.manager.findOne(CarritoEntity, {
        where: { id: Number(carritoId) },
      });

      if (!carrito) {
        throw new NotFoundException(
          `Carrito con ID ${carritoId} no encontrado`,
        );
      }

      if (!carrito.items || carrito.items.length === 0) {
        throw new BadRequestException(
          'No se puede crear orden de carrito vacío',
        );
      }

      // Guardar items antes de vaciar el carrito
      const itemsComprados = JSON.parse(JSON.stringify(carrito.items));
      const totalComprado = carrito.total;

      // 2. Crear la orden con la relación al carrito
      const orden = queryRunner.manager.create(OrdenEntity, {
        carrito: carrito, // Asignar la relación directamente
        compradorId: carrito.compradorId,
        total: carrito.total,
        estadoPago: 'PENDIENTE',
        items: itemsComprados,
      });

      const ordenGuardada = await queryRunner.manager.save(orden);

      // 3. Vaciar el carrito (limpiar items)
      carrito.items = [];
      carrito.total = 0;
      await queryRunner.manager.save(carrito);

      // 4. Commit de la transacción
      await queryRunner.commitTransaction();

      // Retornar orden con detalle de items
      return {
        orden: ordenGuardada,
        items: itemsComprados,
        total: totalComprado,
      };
    } catch (error) {
      // Rollback en caso de error
      await queryRunner.rollbackTransaction();
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al crear la orden: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  // HU4: Informar estado de pago de un carro
  async obtenerEstadoPago(carritoId: string): Promise<string> {
    try {
      // Usar la columna real 'carrito_id' en lugar de la propiedad virtual 'carritoId'
      const orden = await this.ordenesRepository
        .createQueryBuilder('orden')
        .where('orden.carrito_id = :carritoId', {
          carritoId: Number(carritoId),
        })
        .getOne();

      return orden ? orden.estadoPago : 'NO_EXISTE';
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener estado de pago: ${error.message}`,
      );
    }
  }
  // HU5: Obtener historial de órdenes por comprador con detalle de items
  async obtenerHistorialComprador(compradorId: string): Promise<
    Array<{
      orden: OrdenEntity;
      items: any[];
      total: number;
    }>
  > {
    try {
      console.log('Buscando órdenes para el comprador:', compradorId);

      const ordenes = await this.ordenesRepository.find({
        where: { compradorId },
        order: {
          fechaCreacion: 'DESC',
        },
      });

      if (!ordenes || ordenes.length === 0) {
        throw new NotFoundException(
          `No se encontraron órdenes para el comprador ${compradorId}`,
        );
      }

      // Enriquecer cada orden con los items guardados en la orden
      const ordenesConItems = await Promise.all(
        ordenes.map(async (orden) => {
          // Los items ya están guardados en la orden misma
          const items = orden.items ?? [];

          return {
            orden,
            items,
            total: orden.total,
          };
        }),
      );

      return ordenesConItems;
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

  // HU5: Actualizar orden durante el checkout
  async actualizarCheckout(
    ordenId: number,
    items: any[],
  ): Promise<{
    orden: OrdenEntity;
    items: any[];
    total: number;
  }> {
    const orden = await this.ordenesRepository.findOne({
      where: { id: ordenId },
    });

    if (!orden) {
      throw new NotFoundException(`Orden con ID ${ordenId} no encontrada`);
    }

    // Actualizar items
    orden.items = items;

    // Recalcular total
    orden.total = items.reduce(
      (sum, item) => sum + item.precio * item.cantidad,
      0,
    );

    const ordenActualizada = await this.ordenesRepository.save(orden);

    return {
      orden: ordenActualizada,
      items: ordenActualizada.items,
      total: ordenActualizada.total,
    };
  }
}
