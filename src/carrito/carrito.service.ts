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
/*
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
