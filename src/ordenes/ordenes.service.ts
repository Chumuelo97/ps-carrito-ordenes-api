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

    @InjectRepository(OrdenItemEntity)
    private readonly ordenItemRepository: Repository<OrdenItemEntity>,

    private readonly dataSource: DataSource,

    private readonly productosService: ProductosService,
  ) {}

  async crearOrdenDesdeCarrito(
    compradorId: string,
    createOrdenDto?: CreateOrdenDto,
  ): Promise<CreateOrdenResponseDto> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        // Obtener carrito
        const carrito = await manager.findOne(CarritoEntity, { where: { compradorId } });
        if (!carrito) throw new NotFoundException('Carrito no encontrado');
        if (!carrito.items || carrito.items.length === 0)
          throw new BadRequestException('El carrito está vacío');

        // Validar items y calcular total
        let totalCalculado = 0;
        for (const item of carrito.items) {
          if (!item.productoId || !item.cantidad)
            throw new BadRequestException('Item inválido en el carrito');

          const producto = await manager.findOne(ProductoEntity, { where: { id: item.productoId } });
          if (!producto) throw new NotFoundException(`Producto con id ${item.productoId} no existe`);
          if (producto.stock < item.cantidad)
            throw new BadRequestException(`Stock insuficiente para el producto ${producto.nombre}`);

          totalCalculado += Number(item.precio) * Number(item.cantidad);
        }

        // Validar total enviado en body si existe
        if (createOrdenDto?.total != null) {
          const sentTotal = Number(createOrdenDto.total);
          if (Math.abs(sentTotal - totalCalculado) > 0.01)
            throw new BadRequestException(
              `Total enviado (${sentTotal}) no coincide con total del carrito (${totalCalculado})`,
            );
        }

        // Crear orden
        const nuevaOrden = manager.create(OrdenEntity, {
          compradorId,
          total: totalCalculado,
          estadoPago: OrdenStatus.PENDIENTE,
        });
        const ordenGuardada = await manager.save(nuevaOrden);

        // Crear orden_items y reducir stock
        for (const item of carrito.items) {
          const ordenItem = manager.create(OrdenItemEntity, {
            orden: ordenGuardada,
            productoId: item.productoId,
            cantidad: item.cantidad,
            precio: item.precio,
          });
          await manager.save(ordenItem);

          if (this.productosService?.reducirStock) {
            await this.productosService.reducirStock(item.productoId, item.cantidad, manager);
          } else {
            await manager.decrement(ProductoEntity, { id: item.productoId }, 'stock', item.cantidad);
          }
        }

        // Vaciar carrito
        carrito.items = [];
        carrito.total = 0;
        await manager.save(carrito);

        // Preparar response DTO
        const ordenConItems = await manager.findOne(OrdenEntity, {
          where: { id: ordenGuardada.id },
          relations: ['items'],
        });

        if (!ordenConItems) throw new InternalServerErrorException('Error creando la orden');

        const response: CreateOrdenResponseDto = {
          id: ordenConItems.id,
          total: ordenConItems.total,
          estadoPago: String(ordenConItems.estadoPago),
          fecha: ordenConItems.fecha,
          items: (ordenConItems.items || []).map((it) => ({
            productoId: it.productoId,
            cantidad: it.cantidad,
            precio: it.precio,
            subtotal: Number(it.precio) * Number(it.cantidad),
          })),
        };

        return response;
      });
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException ||
        err instanceof InternalServerErrorException
      ) {
        throw err;
      }
      throw new InternalServerErrorException(err?.message || 'Error interno al crear la orden');
    }
  }

  // GET orden por id
  async obtenerOrden(ordenId: number) {
    const orden = await this.ordenRepository.findOne({
      where: { id: ordenId },
      relations: ['items'],
    });
    if (!orden) throw new NotFoundException('Orden no encontrada');
    return orden;
  }

  // GET ordenes por comprador
  async obtenerOrdenesPorComprador(compradorId: string) {
    return this.ordenRepository.find({
      where: { compradorId },
      relations: ['items'],
      order: { fecha: 'DESC' },
    });
  }
}
