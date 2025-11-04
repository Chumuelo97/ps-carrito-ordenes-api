// src/carrito/carrito.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarritoEntity } from './entities/carrito.entity';
import { CarritoItemEntity } from './entities/carrito-item.entity';
import { ProductoDto } from './dto/producto.dto';
import {
  agregarProductosDto,
  CarritoItemDto,
  CrearCarritoDto,
} from './dto/carrito.dto';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class CarritoService {
  constructor(
    @InjectRepository(CarritoEntity)
    private carritoRepository: Repository<CarritoEntity>,
    @InjectRepository(CarritoItemEntity)
    private carritoItemRepository: Repository<CarritoItemEntity>,
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

  private async findProductById(
    productId: number,
  ): Promise<ProductoDto | undefined> {
    const productos = await this.leerProductosDesdeArchivo();
    return productos.find((p) => p.id === productId);
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
        ...item, // Propiedades del item: id, productoId, cantidad, precio
        carritoItemId: item.id, // Asignamos el id del item a la nueva propiedad
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

  async findOne(id: number): Promise<CarritoItemDto> {
    const carrito = await this.carritoRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!carrito) {
      throw new NotFoundException(`Carrito with ID ${id} not found`);
    }
    // Devolvemos el carrito con los items "hidratados"
    return this._hydrateCarrito(carrito);
  }

  async crearCarrito(crearCarritoDto: CrearCarritoDto): Promise<CarritoEntity> {
    const { compradorId } = crearCarritoDto;

    // Buscar si ya existe un carrito para el comprador
    let carrito = await this.carritoRepository.findOne({
      where: { compradorId },
      relations: ['items'],
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
    carrito = await this._hydrateCarrito(carrito);

    return carrito as CarritoEntity;
  }

  /**
   * ---- ¡MÉTODO MODIFICADO! ----
   * Ahora utiliza el helper _hydrateCarrito para devolver los datos completos tras agregar un producto.
   */
  async agregarProducto(
    agregarAlCarro: agregarProductosDto,
  ): Promise<CarritoEntity> {
    const producto = await this.findProductById(agregarAlCarro.productoId);

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    if (producto.quantity < agregarAlCarro.cantidad) {
      throw new BadRequestException('Stock insuficiente');
    }

    let carrito = await this.carritoRepository.findOne({
      where: { compradorId: agregarAlCarro.compradorId },
      relations: ['items'],
    });

    if (!carrito) {
      carrito = await this.crearCarrito({
        compradorId: agregarAlCarro.compradorId,
        //items: []
      });
    }

    let item = carrito.items?.find(
      (i) => i.productoId === agregarAlCarro.productoId,
    );

    if (item) {
      item.cantidad += agregarAlCarro.cantidad;
      await this.carritoItemRepository.save(item);
    } else {
      const nuevoItem = this.carritoItemRepository.create({
        productoId: agregarAlCarro.productoId,
        cantidad: agregarAlCarro.cantidad,
        precio: producto.price,
        carrito: carrito,
      });
      await this.carritoItemRepository.save(nuevoItem);
      carrito.items.push(nuevoItem);
    }

    carrito.total = carrito.items.reduce(
      (sum, currentItem) => sum + currentItem.precio * currentItem.cantidad,
      0,
    );

    return this.carritoRepository.save(carrito);
  }
}
/**
   * ---- ¡MÉTODO MODIFICADO! ----
   * Ahora utiliza el helper _hydrateCarrito para devolver los datos completos tras eliminar un producto.
   
  async eliminarProducto(
    eliminarProductoDto: EliminarProductoDto,
  ): Promise<CarritoDetalladoDto> {
    const carrito = await this.carritoRepository.findOne({
      where: { compradorId: eliminarProductoDto.compradorId },
      relations: ['items'],
    });

    if (!carrito) {
      throw new NotFoundException(
        `Carrito para el comprador ${eliminarProductoDto.compradorId} no encontrado.`,
      );
    }

    const itemIndex = carrito.items.findIndex(
      (item) => item.productoId === eliminarProductoDto.productoId,
    );

    if (itemIndex === -1) {
      throw new NotFoundException(
        `Producto con ID ${eliminarProductoDto.productoId} no encontrado en el carrito.`,
      );
    }

    const itemAEliminar = carrito.items[itemIndex];
    await this.carritoItemRepository.remove(itemAEliminar);
    carrito.items.splice(itemIndex, 1);

    carrito.total = carrito.items.reduce(
      (sum, item) => sum + item.precio * item.cantidad,
      0,
    );

    const carritoGuardado = await this.carritoRepository.save(carrito);

    // Devolvemos el carrito con los items "hidratados"
    return this._hydrateCarrito(carritoGuardado);
  }
}*/

// src/carrito/carrito.service.ts
/*import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarritoEntity } from './entities/carrito.entity';
import { CarritoItemEntity } from './entities/carrito-item.entity';
import { ProductoDto } from './dto/producto.dto';
import {
  agregarProductosAlCarritoDto,
  CreateCarritoDto,
  EliminarProductoDto,
  CarritoItemDto,
} from './dto/carrito.dto';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class CarritoService {
  constructor(
    @InjectRepository(CarritoEntity)
    private carritoRepository: Repository<CarritoEntity>,
    @InjectRepository(CarritoItemEntity)
    private carritoItemRepository: Repository<CarritoItemEntity>,
  ) {}

  async leerProductosDesdeArchivo(): Promise<ProductoDto[]> {
    try {
      const data = await fs.readFile(
        path.join(__dirname, '..', 'productos.txt'),
        'utf8',
      );
      const productos = JSON.parse(data);
      return productos;
    } catch (error) {
      console.error('Error al leer el archivo de productos:', error);
      return [];
    }
  }

  private async findProductById(
    productId: number,
  ): Promise<ProductoDto | undefined> {
    const productos = await this.leerProductosDesdeArchivo();
    const producto = productos.find((p) => p.id === productId);
    return producto;
  }

  // src/carrito/carrito.service.ts
  async findOne(id: number): Promise<CarritoEntity> {
    const carrito = await this.carritoRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!carrito) {
      throw new NotFoundException(`Carrito with ID ${id} not found`);
    }
    return carrito;
  }

  async crearCarrito(
    createCarritoDto: CreateCarritoDto,
  ): Promise<CarritoEntity> {
    const carrito = this.carritoRepository.create({
      compradorId: createCarritoDto.compradorId,
      total: 0, // Se calculará cuando se agreguen productos
      items: [],
    });

    return this.carritoRepository.save(carrito);
  }

  async agregarProducto(
    addToCartDto: agregarProductosAlCarritoDto,
  ): Promise<CarritoEntity> {
    // Verificar si el producto existe y tiene stock
    const producto = await this.findProductById(addToCartDto.productoId);

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    if (producto.quantity < addToCartDto.cantidad) {
      throw new BadRequestException('Stock insuficiente');
    }

    // Buscar o crear carrito para el comprador
    let carrito = await this.carritoRepository.findOne({
      where: { compradorId: addToCartDto.compradorId },
      relations: ['items'],
    });

    if (!carrito) {
      carrito = await this.crearCarrito({
        compradorId: addToCartDto.compradorId,
        items: [],
      });
    }

    // Actualizar o agregar item al carrito
    let item = carrito.items?.find(
      (i) => i.productoId === addToCartDto.productoId,
    );

    if (item) {
      item.cantidad += addToCartDto.cantidad;
    } else {
      const nuevoItem = this.carritoItemRepository.create({
        productoId: addToCartDto.productoId,
        cantidad: addToCartDto.cantidad,
        precio: producto.price,
        carrito: carrito, // Asociamos el item al carrito
      });
      await this.carritoItemRepository.save(nuevoItem);
      carrito.items.push(nuevoItem);
    }

    // Actualizar total del carrito
    carrito.total = carrito.items.reduce(
      (sum, item) => sum + item.precio * item.cantidad,
      0,
    );

    return this.carritoRepository.save(carrito);
  }

  async eliminarProducto(
    eliminarProductoDto: EliminarProductoDto,
  ): Promise<CarritoEntity> {
    // 1. Buscar el carrito del comprador
    const carrito = await this.carritoRepository.findOne({
      where: { compradorId: eliminarProductoDto.compradorId },
      relations: ['items'], // <--- Corregido: debe ser 'items' para cargar los ítems del carrito
    });

    if (!carrito) {
      throw new NotFoundException(
        `Carrito para el comprador ${eliminarProductoDto.compradorId} no encontrado.`,
      );
    }

    // 2. Buscar el ítem a eliminar dentro del carrito
    const itemIndex = carrito.items.findIndex(
      (item) => item.productoId === eliminarProductoDto.productoId,
    );

    if (itemIndex === -1) {
      throw new NotFoundException(
        `Producto con ID ${eliminarProductoDto.productoId} no encontrado en el carrito.`,
      );
    }

    // 3. Eliminar el ítem de la base de datos y del array del carrito
    const itemAEliminar = carrito.items[itemIndex];
    await this.carritoItemRepository.remove(itemAEliminar);
    carrito.items.splice(itemIndex, 1);

    // 4. Recalcular el total
    carrito.total = carrito.items.reduce(
      (sum, item) => sum + item.precio * item.cantidad,
      0,
    );

    // 5. Guardar y devolver el carrito actualizado
    return this.carritoRepository.save(carrito);
  }
}

servicio de mentira con el detalle de productos:
-id-producto
-nombre
-cantidad
-precio
Metodos:
-crear carrito
-obtener carrito por id
-actualizar carrito
-eliminar carrito
-listar todos los carritos
*/
