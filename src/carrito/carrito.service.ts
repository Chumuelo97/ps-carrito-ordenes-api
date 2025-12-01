// src/carrito/carrito.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarritoEntity } from './entities/carrito.entity';
import { ProductoDto } from './dto/producto.dto';
import {
  agregarProductosDto,
  CrearCarritoDto,
  EliminarProductoDto,
  CarritoDetalladoDto,
  EliminarCarritoDto,
} from './dto/carrito.dto';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class CarritoService {
  constructor(
    @InjectRepository(CarritoEntity)
    private carritoRepository: Repository<CarritoEntity>,
  ) {}

  async leerProductosDesdeArchivo(): Promise<ProductoDto[]> {
    try {
      const data = await fs.readFile(
        path.join(__dirname, '..', 'productos.txt'),
        'utf8',
      );
      const productos = JSON.parse(data);
      if (!Array.isArray(productos)) {
        throw new Error('El archivo de productos no contiene un array válido.');
      }
      return productos;
    } catch (error) {
      console.error('Error al leer el archivo de productos:', error.message);
      return [];
    }
  }

  /**
   * ---- ¡NUEVO MÉTODO PRIVADO! ----
   * Este método se encarga de "hidratar" el carrito.
   * Combina la información de los items del carrito con los detalles completos del producto.
   */
  private async _hydrateCarrito(carrito: CarritoEntity): Promise<any> {
    if (!carrito || !Array.isArray(carrito.items)) {
      return carrito;
    }

    const todosLosProductos = await this.leerProductosDesdeArchivo();
    const productosMap = new Map(todosLosProductos.map((p) => [p.id, p]));

    const itemsDetallados = carrito.items.map((item) => {
      const detallesProducto = productosMap.get(item.productoId);
      return {
        ...item, // Propiedades del item: productoId, cantidad, precio
        // Si el item tenía un carritoItemId lo mantenemos; si no, queda undefined
        carritoItemId: (item as any).carritoItemId,
        // Propiedades del producto que agregamos:
        name: detallesProducto?.name || 'Producto no encontrado',
        imageUrl: detallesProducto?.imageUrl || '',
        category: detallesProducto?.category || '',
        ...detallesProducto, // Agregamos el resto de propiedades de ProductoDto
      };
    });

    return {
      ...carrito,
      items: itemsDetallados,
    };
  }

  /*  * CRUD de la entidad Carrito
   * encontrarCarritoPorId
   * crearCarrito
   * eliminarCarrito
   * obtenerCarritos
  */

  async obtenerCarritos(): Promise<CarritoDetalladoDto[]> {
    const carritos = await this.carritoRepository.find();
    const carritosHidratados = await Promise.all(
      carritos.map((carrito) => this._hydrateCarrito(carrito)),
    );
    return carritosHidratados as CarritoDetalladoDto[];
  }

  //get carritos por id
  async encontrarCarritoPorId(id: number): Promise<CarritoDetalladoDto> {
    const carrito = await this.carritoRepository.findOne({
      where: { id },
    });
    if (!carrito) {
      throw new NotFoundException(`Carrito with ID ${id} not found`);
    }
    const carritoHidratado = await this._hydrateCarrito(carrito);
    return carritoHidratado as CarritoDetalladoDto;
  }

  async crearCarrito(
    crearCarritoDto: CrearCarritoDto,
  ): Promise<CarritoDetalladoDto> {
    const { compradorId } = crearCarritoDto;

    // Buscar si ya existe un carrito para el comprador
    let carrito = await this.carritoRepository.findOne({
      where: { compradorId },
    });

    if (!carrito) {
      // Si no existe, crear un nuevo carrito vacío
      carrito = this.carritoRepository.create({
        compradorId,
        total: 0,
      });
      carrito.items = []; // Inicializamos los items como un array vacío
      carrito = await this.carritoRepository.save(carrito);
    }

    // Hidratar el carrito con los productos asociados
    const carritoHidratado = await this._hydrateCarrito(carrito);
    return carritoHidratado as CarritoDetalladoDto;
  }

  async eliminarCarrito(
    eliminarCarritoDto: EliminarCarritoDto,
  ): Promise<CarritoDetalladoDto> {
    // This method deletes a whole cart. Prefer carritoId if provided,
    // otherwise pick the most recent cart for the compradorId.
    const { compradorId, carritoId } = eliminarCarritoDto as any;

    return (async () => {
      let carrito: CarritoEntity | null = null;

      if (carritoId) {
        carrito = await this.carritoRepository.findOne({
          where: { id: carritoId },
        });
      } else {
        carrito = await this.carritoRepository.findOne({
          where: { compradorId },
          order: { id: 'DESC' },
        });
      }

      if (!carrito) {
        throw new NotFoundException(
          `Carrito para el comprador ${compradorId} no encontrado.`,
        );
      }

      // Hydrate a copy to return after deletion
      const carritoHidratado = await this._hydrateCarrito(carrito);

      // Delete the carrito
      await this.carritoRepository.remove(carrito);

      // Return the hydrated snapshot of the deleted cart
      return carritoHidratado as CarritoDetalladoDto;
    })();
  }

  /*  * CRUD de la entidad Producto en el carrito
   * agregarProducto
   * encontrarProductoPorId <--- ESTO LEE LOS PRODUCTOS DESDE EL ARCHIVO 'productos.txt'
   * eliminarProductoDelCarrito
   */

  private async encontrarProductoPorId(
    productId: number,
  ): Promise<ProductoDto | undefined> {
    const productos = await this.leerProductosDesdeArchivo();
    return productos.find((p) => p.id === productId);
  }

  async agregarProducto(
    agregarAlCarro: agregarProductosDto,
  ): Promise<CarritoDetalladoDto> {
    const producto = await this.encontrarProductoPorId(
      agregarAlCarro.productoId,
    );

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    if (producto.quantity < agregarAlCarro.cantidad) {
      throw new BadRequestException('Stock insuficiente');
    }

    let carrito = await this.carritoRepository.findOne({
      where: { compradorId: agregarAlCarro.compradorId },
    });

    if (!carrito) {
      carrito = this.carritoRepository.create({
        compradorId: agregarAlCarro.compradorId,
        total: 0,
        items: [],
      });
      carrito = await this.carritoRepository.save(carrito);
    }

    let item = carrito.items?.find(
      (i) => i.productoId === agregarAlCarro.productoId,
    );

    if (item) {
      item.cantidad += agregarAlCarro.cantidad;
      // guardamos el carrito completo (items son JSON, repository.save lo persistirá)
    } else {
      const nuevoItem = {
        productoId: agregarAlCarro.productoId,
        cantidad: agregarAlCarro.cantidad,
        precio: producto.price,
      };
      carrito.items = carrito.items || [];
      carrito.items.push(nuevoItem as any);
    }

    carrito.total = carrito.items.reduce(
      (sum, currentItem) =>
        sum +
        Number((currentItem as any).precio || 0) *
          Number((currentItem as any).cantidad || 0),
      0,
    );

    const carritoGuardado = await this.carritoRepository.save(carrito);
    const carritoHidratado = await this._hydrateCarrito(carritoGuardado);
    return carritoHidratado as CarritoDetalladoDto;
  }

  /**
   * Eliminar un producto específico del carrito (por productoId).
   * Prefiere `carritoId` si viene en el DTO; si no, usa el carrito más reciente
   * del `compradorId`.
   */
  async eliminarProducto(
    eliminarProductoDto: EliminarProductoDto,
  ): Promise<CarritoDetalladoDto> {
    const { compradorId, productoId, carritoId } = eliminarProductoDto as any;

    let carrito: CarritoEntity | null = null;
    if (carritoId) {
      carrito = await this.carritoRepository.findOne({ where: { id: carritoId } });
    } else {
      carrito = await this.carritoRepository.findOne({ where: { compradorId }, order: { id: 'DESC' } });
    }

    if (!carrito) {
      throw new NotFoundException(`Carrito para el comprador ${compradorId} no encontrado.`);
    }

    // Asegurarnos de que items es un array
    if (!Array.isArray(carrito.items) || carrito.items.length === 0) {
      throw new NotFoundException(`No hay productos en el carrito del comprador ${compradorId}.`);
    }

    const itemIndex = carrito.items.findIndex((item) => item.productoId === productoId);
    if (itemIndex === -1) {
      throw new NotFoundException(`Producto con ID ${productoId} no encontrado en el carrito.`);
    }

    const eliminarCantidad = Number((eliminarProductoDto as any).cantidad) || 0;
    if (eliminarCantidad <= 0) {
      throw new BadRequestException('La cantidad a eliminar debe ser mayor que 0');
    }

    const item = carrito.items[itemIndex] as any;
    // Si la cantidad a eliminar es mayor o igual a la cantidad en el carrito, removemos el item
    if (eliminarCantidad >= Number(item.cantidad)) {
      carrito.items.splice(itemIndex, 1);
    } else {
      // Sino, decrementamos la cantidad
      item.cantidad = Number(item.cantidad) - eliminarCantidad;
      carrito.items[itemIndex] = item;
    }
    carrito.total = carrito.items.reduce((sum, item) => {
      const precio = Number((item as any).precio) || 0;
      const cantidad = Number((item as any).cantidad) || 0;
      return sum + precio * cantidad;
    }, 0);

    const carritoGuardado = await this.carritoRepository.save(carrito);
    const carritoHidratado = await this._hydrateCarrito(carritoGuardado);
    return carritoHidratado as CarritoDetalladoDto;
  }

  /*async eliminarProductoDelCarrito(
    eliminarProductoDto: EliminarProductoDto,
  ): Promise<EliminarProductoDto> {
    const { compradorId, productoId } = eliminarProductoDto;
    const carrito = await this.carritoRepository.findOne({
      where: { compradorId },
    });
    if (!carrito) {
      throw new NotFoundException('Carrito no encontrado');
    }

    const itemIndex = carrito.items.findIndex(
      (item) => item.productoId === productoId,
    );
    if (itemIndex === -1) {
      throw new NotFoundException('Producto no encontrado en el carrito');
    }

    carrito.items.splice(itemIndex, 1);
    carrito.total = carrito.items.reduce(
      (sum, currentItem) =>
        sum +
        Number((currentItem as any).precio || 0) *
          Number((currentItem as any).cantidad || 0),
      0,
    );

    const carritoGuardado = await this.carritoRepository.save(carrito);
    const carritoHidratado = await this._hydrateCarrito(carritoGuardado);
    return carritoHidratado as EliminarProductoDto;
  }*/
}
