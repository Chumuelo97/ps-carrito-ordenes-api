// src/ordenes/entities/orden.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  RelationId,
} from 'typeorm';
import { CarritoEntity } from '../../carrito/entities/carrito.entity';

@Entity('ordenes')
export class OrdenEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @RelationId((orden: OrdenEntity) => orden.carrito)
  carritoId: number;

  @Column('varchar', { name: 'comprador_id', length: 255 })
  compradorId: string;

  @Column('enum', {
    name: 'estado_pago',
    enum: ['PENDIENTE', 'PAGADO', 'CANCELADO'],
    default: 'PENDIENTE',
  })
  estadoPago: string;
  
  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @CreateDateColumn({ type: 'timestamp', name: 'fecha_creacion' })
  fechaCreacion: Date;

  @ManyToOne(() => CarritoEntity, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'carrito_id' })
  carrito: CarritoEntity;
}
