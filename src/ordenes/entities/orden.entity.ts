import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { CarritoEntity } from '../../carrito/entities/carrito.entity';

@Entity('ordenes')
export class OrdenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CarritoEntity)
  carrito: CarritoEntity;

  @Column()
  carritoId: string;

  @Column()
  compradorId: string;

  @Column({
    type: 'enum',
    enum: ['PENDIENTE', 'PAGADO', 'CANCELADO'],
    default: 'PENDIENTE',
  })
  estadoPago: string;

  @CreateDateColumn()
  fechaCreacion: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;
}
