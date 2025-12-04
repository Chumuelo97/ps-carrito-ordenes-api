import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { OrdenEntity } from './entities/orden.entity';
import { OrdenItemEntity } from './entities/orden-item.entity';
import { CarritoEntity } from '../carrito/entities/carrito.entity';
import { ProductoEntity } from '../productos/entities/producto.entity';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { CreateOrdenResponseDto, OrdenItemResponseDto } from './dto/create-orden-response.dto';
import { OrdenStatus } from './orden-status.enum';
import { ProductosService } from '../productos/productos.service';

@Injectable()
export class OrdenesService {
  constructor(
    @InjectRepository(OrdenEntity)
    private readonly ordenRepository: Repository<OrdenEntity>,

    // Repos usados fuera de la transacción (para consultas simples)
    @InjectRepository(OrdenItemEntity)
    private readonly ordenItemRepository: Repository<OrdenItemEntity>,

    private readonly dataSource: DataSource,

    // Usamos ProductosService si está disponible para reducción de stock (acepta manager).
    private readonly productosService: ProductosService,
  ) {}

  /**
   * Crea una orden leyendo los items desde la fila de Carrito (columna JSON).
   * Ejecuta TODO en una transacción atómica: validaciones, creación de orden + items,
   * reducción de stock y vaciado de carrito.
   *
   * compradorId: string (viene por param en la ruta)
   * createOrdenDto: opcional, si quieres pasar direccion/nombre/total (esto se validará)
   */
  async crearOrdenDesdeCarrito(
    compradorId: string,
    createOrdenDto?: CreateOrdenDto,
  ): Promise<CreateOrdenResponseDto> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        // 1) Obtener carrito dentro de la transacción
        const carrito = await manager.findOne(CarritoEntity, {
          where: { compradorId },
        });

        if (!carrito) throw new NotFoundException('Carrito no encontrado');
        if (!carrito.items || carrito.items.length === 0)
          throw new BadRequestException('El carrito está vacío');

        // 2) Validar productos y stock, calcular total a partir del carrito (precio desde carrito)
        let totalCalculado = 0;
        for (const item of carrito.items) {
          // item: { productoId, cantidad, precio, ... }
          if (!item.productoId || !item.cantidad) {
            throw new BadRequestException('Item inválido en el carrito');
          }

          const producto = await manager.findOne(ProductoEntity, {
            where: { id: item.productoId },
          });

          if (!producto) {
            throw new NotFoundException(
              `Producto con id ${item.productoId} no existe`,
            );
          }

          if (producto.stock < item.cantidad) {
            throw new BadRequestException(
              `Stock insuficiente para el producto ${producto.nombre}`,
            );
          }

          // Suma usando el precio almacenado en el carrito (decisión de diseño)
          totalCalculado += Number(item.precio) * Number(item.cantidad);
        }

        // 2.b) Si el usuario envió un total en el body, validar que coincida con el carrito
        if (createOrdenDto && createOrdenDto.total != null) {
          const sentTotal = Number(createOrdenDto.total);
          // tolerancia mínima por decimales
          if (Math.abs(sentTotal - totalCalculado) > 0.01) {
            throw new BadRequestException(
              `Total enviado (${sentTotal}) no coincide con total del carrito (${totalCalculado})`,
            );
          }
        }

        // 3) Crear la orden
        const nuevaOrden = manager.create(OrdenEntity, {
          compradorId,
          total: totalCalculado,
          estadoPago: OrdenStatus.PENDIENTE,
          // fecha se crea automáticamente por CreateDateColumn
        });

        const ordenGuardada = await manager.save(nuevaOrden);

        // 4) Crear orden_items y reducir stock
        for (const item of carrito.items) {
          const ordenItem = manager.create(OrdenItemEntity, {
            orden: ordenGuardada,
            productoId: item.productoId,
            cantidad: item.cantidad,
            precio: item.precio,
          });

          await manager.save(ordenItem);

          // Reducir stock: preferimos usar ProductosService.reducirStock si existe (acepta manager)
          try {
            if (this.productosService && this.productosService.reducirStock) {
              await this.productosService.reducirStock(
                item.productoId,
                item.cantidad,
                manager,
              );
            } else {
              // Fallback directo con manager.decrement si ProductosService no está disponible
              await manager.decrement(
                ProductoEntity,
                { id: item.productoId },
                'stock',
                item.cantidad,
              );
            }
          } catch (err: any) {
            // Si la reducción de stock falla, lanzamos para que la transacción haga rollback
            throw err;
          }
        }

        // 5) Vaciar carrito dentro de la transacción (importantísimo para consistencia)
        carrito.items = [];
        carrito.total = 0;
        await manager.save(carrito);

        // 6) Preparar response DTO: leer la orden con items (eager true debería haber cargado items)
        const ordenConItems = await manager.findOne(OrdenEntity, {
          where: { id: ordenGuardada.id },
          relations: ['items'],
        });

        if (!ordenConItems) {
          // improbable, pero por seguridad
          throw new InternalServerErrorException('Error creando la orden');
        }

        // Mapear a CreateOrdenResponseDto
        const response: CreateOrdenResponseDto = {
          id: ordenConItems.id,
          total: ordenConItems.total,
          estadoPago: String(ordenConItems.estadoPago),
          fecha: ordenConItems.fecha,
          items: (ordenConItems.items || []).map((it) => {
            const oi: OrdenItemResponseDto = {
              productoId: it.productoId,
              cantidad: it.cantidad,
              precio: it.precio,
              subtotal: Number(it.precio) * Number(it.cantidad),
            };
            return oi;
          }),
        };

        return response;
      });
    } catch (err) {
      // Re-lanzar excepciones conocidas para que controller las convierta en respuestas HTTP
      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException ||
        err instanceof InternalServerErrorException
      ) {
        throw err;
      }

      // Si viene de ProductosService (BadRequestException por stock insuficiente) ya está bien.
      // Si es otro error, envolverlo como 500.
      throw new InternalServerErrorException(
        err?.message || 'Error interno al crear la orden',
      );
    }
  }

  // Métodos auxiliares para los endpoints GET existentes
  async obtenerOrden(ordenId: number) {
    const orden = await this.ordenRepository.findOne({
      where: { id: ordenId },
      relations: ['items'],
    });
    if (!orden) throw new NotFoundException('Orden no encontrada');
    return orden;
  }

  async obtenerOrdenesPorComprador(compradorId: string) {
    return this.ordenRepository.find({
      where: { compradorId },
      relations: ['items'],
      order: { fecha: 'DESC' },
    });
  }
}
