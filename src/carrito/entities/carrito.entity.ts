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
  @Column('decimal', { name: 'total', precision: 12, scale: 2, default: 0 })
  total: number;

  // Un carrito tiene MUCHOS items.
  // cascade: true permite persistir nuevos items al guardar el carrito.
  // orphanedRowAction: 'delete' eliminará filas huérfanas cuando se quiten del array y se guarde el carrito (TypeORM v0.3+).
  // Guardamos los items directamente como JSON en la columna `items`.
  // Esto permite que el servicio y el controlador trabajen solo con
  // `CarritoEntity` y arrays/plains objects.
  // Guardamos JSON serializado en texto (`simple-json`) y mapeamos la columna a
  // `productos` en la base de datos (nombre en español). Si prefieres JSON
  // nativo en MySQL cambia a @Column('json', { name: 'productos', nullable: true }).
  @Column('simple-json', { name: 'productos', nullable: true })
  items: Array<{
    productoId: number;
    cantidad: number;
    precio: number;
    // Campos opcionales para enriquecer visualización sin romper compatibilidad
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
