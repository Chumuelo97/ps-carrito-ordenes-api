import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarritoEntity } from './entities/carrito.entity';

@Injectable()
export class CarritoService {
  private readonly logger = new Logger(CarritoService.name);

  constructor(
    @InjectRepository(CarritoEntity)
    private readonly carritoRepository: Repository<CarritoEntity>,
  ) {}

  async obtenerCarrito(compradorId: string) {
    const carrito = await this.carritoRepository.findOne({
      where: { compradorId },
      relations: ['items'],
    });

    if (!carrito) {
      throw new NotFoundException('Carrito no encontrado');
    }

    return carrito;
  }

  async vaciarCarrito(compradorId: string) {
    const carrito = await this.obtenerCarrito(compradorId);
    carrito.items = [];
    carrito.total = 0;

    await this.carritoRepository.save(carrito);
  }

  async crearCarrito(compradorId: string) {
    let carrito = await this.carritoRepository.findOne({
      where: { compradorId },
    });

    if (!carrito) {
      carrito = this.carritoRepository.create({
        compradorId,
        items: [],
        total: 0,
      });

      await this.carritoRepository.save(carrito);
    }

    return carrito;
  }
}
