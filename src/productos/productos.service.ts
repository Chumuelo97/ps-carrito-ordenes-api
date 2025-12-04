// src/productos/productos.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { ProductoEntity } from './entities/producto.entity';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(ProductoEntity)
    private readonly productoRepository: Repository<ProductoEntity>,
  ) {}

  // Obtener producto por id (usa findOneBy para compatibilidad TypeORM >=0.3)
  async findOne(id: number) {
    const producto = await this.productoRepository.findOneBy({ id });
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return producto;
  }

  // Reducir stock; si se pasa manager, se usa la transacción
  async reducirStock(productoId: number, cantidad: number, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(ProductoEntity) : this.productoRepository;

    const producto = await repo.findOneBy({ id: productoId });
    if (!producto) throw new NotFoundException('Producto no encontrado');

    if (producto.stock < cantidad) throw new BadRequestException('Stock insuficiente');

    producto.stock -= cantidad;
    return await repo.save(producto);
  }
}
