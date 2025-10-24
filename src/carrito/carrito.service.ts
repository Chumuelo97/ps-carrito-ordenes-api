// src/carrito/carrito.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarritoEntity } from './entities/carrito.entity';

@Injectable()
export class CarritoService {
  constructor(
    @InjectRepository(CarritoEntity)
    private carritoRepository: Repository<CarritoEntity>,
  ) {}

  // src/carrito/carrito.service.ts
  async findOne(id: number): Promise<CarritoEntity> {
    const carrito = await this.carritoRepository.findOne({ where: { id } });
    if (!carrito) {
      throw new NotFoundException(`Carrito with ID ${id} not found`);
    }
    return carrito;
  }
}
