// src/carrito/entities/carrito-item.entity.ts (Nuevo archivo)
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { CarritoEntity } from './carrito.entity';

@Entity('carrito_items')
export class CarritoItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productoId: number;

  @Column()
  cantidad: number;

  @Column('decimal', { precision: 10, scale: 2 })
  precio: number;

  @ManyToOne(() => CarritoEntity, (carrito) => carrito.items)
  carrito: CarritoEntity;
}
