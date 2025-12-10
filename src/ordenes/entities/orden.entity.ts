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

  @Column('decimal', {
    name: 'total',
    precision: 12,
    scale: 2,
    default: 0,
    comment: 'Total en pesos chilenos (CLP)',
    transformer: {
      from: (value: string) => parseFloat(value),
      to: (value: number) => Math.round(value * 100) / 100,
    },
  })
  total: number;

  @Column('simple-json', { name: 'items', nullable: true })
  items: Array<{
    productoId: number;
    cantidad: number;
    precio: number;
    sku?: string;
    name?: string;
    imageUrl?: string;
    category?: string;
  }>;

  @CreateDateColumn({ type: 'timestamp', name: 'fecha_creacion' })
  fechaCreacion: Date;

  @ManyToOne(() => CarritoEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'carrito_id' })
  carrito: CarritoEntity;
}
