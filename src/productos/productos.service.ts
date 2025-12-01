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

  async findOne(id: number) {
    const producto = await this.productoRepository.findOne({ where: { id } });
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return producto;
  }

  async reducirStock(productoId: number, cantidad: number, manager?: EntityManager) {
    const repo = manager ?? this.productoRepository;
    const producto = await repo.findOne({ where: { id: productoId } });
    if (!producto) throw new NotFoundException('Producto no encontrado');

    if (producto.stock < cantidad)
      throw new BadRequestException('Stock insuficiente');

    producto.stock -= cantidad;
    return await repo.save(producto);
  }
}
