import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { OrdenEntity } from './entities/orden.entity';
import { OrdenItemEntity } from './entities/orden-item.entity';
import { CarritoService } from 'src/carrito/carrito.service';
import { ProductosService } from 'src/productos/productos.service';
import { CheckoutDto } from './dto/checkout.dto';
import { FiltersOrdenDto } from './dto/filters-orden.dto';
import { OrdenStatus } from './orden-status.enum';

@Injectable()
export class OrdenesService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(OrdenEntity)
    private readonly ordenRepo: Repository<OrdenEntity>,
    @InjectRepository(OrdenItemEntity)
    private readonly itemRepo: Repository<OrdenItemEntity>,
    private readonly carritoService: CarritoService,
    private readonly productosService: ProductosService,
  ) {}

  async checkout(compradorId: string, dto: CheckoutDto) {
    const carrito = await this.carritoService.obtenerCarrito(compradorId);
    if (!carrito || carrito.items.length === 0)
      throw new BadRequestException('El carrito está vacío.');

    return await this.dataSource.transaction(async (manager) => {
      let total = 0;
      const itemsEntities: OrdenItemEntity[] = [];

      for (const item of carrito.items) {
        const producto = await this.productosService.findOne(item.productoId);
        if (producto.stock < item.cantidad)
          throw new BadRequestException(`Stock insuficiente para: ${producto.nombre}`);

        producto.stock -= item.cantidad;
        await manager.save(producto);

        total += item.cantidad * producto.precio;

        const itemEntity = manager.create(OrdenItemEntity, {
          productoId: producto.id,
          cantidad: item.cantidad,
          precio: producto.precio,
        });
        itemsEntities.push(itemEntity);
      }

      const orden = manager.create(OrdenEntity, {
        compradorId,
        total,
        estadoPago: OrdenStatus.PENDIENTE,
        items: itemsEntities,
        carrito,
      });

      await manager.save(orden);

      await this.carritoService.vaciarCarrito(compradorId);

      return {
        id: orden.id,
        total: orden.total.toString(), // corregido para evitar error de tipo
        estadoPago: orden.estadoPago,
        fecha: orden.fecha,
      };
    });
  }

  async misOrdenes(compradorId: string, filtros: FiltersOrdenDto) {
    const query = this.ordenRepo
      .createQueryBuilder('orden')
      .where('orden.compradorId = :compradorId', { compradorId });

    if (filtros.estado) {
      query.andWhere('orden.estadoPago = :estado', { estado: filtros.estado });
    }

    query.skip((filtros.page - 1) * filtros.limit);
    query.take(filtros.limit);

    return query.getMany();
  }

  async obtenerOrdenPorId(id: number, compradorId: string) {
    const orden = await this.ordenRepo.findOne({
      where: { id, compradorId },
      relations: ['items'],
    });
    if (!orden) throw new NotFoundException('Orden no encontrada');
    return orden;
  }
}
