// src/carrito/entities/carrito.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('carrito')
export class CarritoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  compradorId: string;

  @Column('decimal')
  total: number;
}
