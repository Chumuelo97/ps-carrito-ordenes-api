// src/ordenes/entities/orden.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('ordenes')
export class OrdenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int')
  carritoId: number; 

  @Column({ length: 255 })
  compradorId: string;

  @Column('enum', {
    enum: ['PENDIENTE', 'PAGADO', 'CANCELADO'],
    default: 'PENDIENTE',
  })
  estadoPago: string;

  @CreateDateColumn({ type: 'datetime' })
  fechaCreacion: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;
}
