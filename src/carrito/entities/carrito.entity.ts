// src/carrito/entities/carrito.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { OrdenEntity } from 'src/ordenes/entities/orden.entity';

@Entity('carrito')
export class CarritoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 255 })
  @Index()
  compradorId: string;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  total: number;

  @Column('simple-json', { nullable: true })
  items: Array<{ productoId: number; cantidad: number; precio: number; carritoItemId?: number }>;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  // Relación con OrdenEntity
  @OneToMany(() => OrdenEntity, orden => orden.carrito)
  ordenes: OrdenEntity[];
}
