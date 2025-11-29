// src/ordenes/entities/orden.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CarritoEntity } from 'src/carrito/entities/carrito.entity';

@Entity('ordenes')
export class OrdenEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  carritoId: number;

  @ManyToOne(() => CarritoEntity, carrito => carrito.ordenes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'carritoId' })
  carrito: CarritoEntity;

  @Column('varchar', { length: 255 })
  compradorId: string;

  @Column('enum', {
    enum: ['PENDIENTE', 'PAGADO', 'CANCELADO'],
    default: 'PENDIENTE',
  })
  estadoPago: string;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @CreateDateColumn({ type: 'timestamp' })
  fechaCreacion: Date;
}
