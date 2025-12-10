// src/carrito/entities/carrito.entity.ts (Modificado)
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { OrdenEntity } from '../../ordenes/entities/orden.entity';
// Note: we store items as JSON inside the carrito table, to keep the API
// working only with `CarritoEntity` and avoid a separate carrito_items table.

@Entity('carrito')
export class CarritoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { name: 'comprador_id', length: 255 })
  @Index()
  compradorId: string;

  // Usar 2 decimales para representar montos en moneda (ej: pesos)
  @Column('decimal', { name: 'total', precision: 12, scale: 1, default: 0 })
  total: number;

  @Column('simple-json', { name: 'productos', nullable: true })
  items: Array<{
    productoId: number;
    cantidad: number;
    precio: number;
    sku?: string;
    name?: string;
    imageUrl?: string;
    category?: string;
    carritoItemId?: number;
  }>;

  // Timestamps útiles para depuración y para elegir el carrito "más reciente"
  @CreateDateColumn({ type: 'timestamp', name: 'fecha_creacion' })
  fecha_creacion: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'fecha_actualizacion' })
  fecha_actualizacion: Date;

  @OneToMany(() => OrdenEntity, (orden) => orden.carrito)
  ordenes?: OrdenEntity[];
}
