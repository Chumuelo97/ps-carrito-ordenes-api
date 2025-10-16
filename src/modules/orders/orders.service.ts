import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  findAll(): Promise<Order[]> {
    return this.orderRepo.find({ relations: ['items'] });
  }

  findOne(id: number): Promise<Order | null> {
    return this.orderRepo.findOne({ where: { id }, relations: ['items'] });
  }
}
