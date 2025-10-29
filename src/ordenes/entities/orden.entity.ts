// src/ordenes/entities/orden.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('ordenes')
export class OrdenEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  carritoId: number;

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
