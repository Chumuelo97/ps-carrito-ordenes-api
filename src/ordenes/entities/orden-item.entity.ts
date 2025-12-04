import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { OrdenEntity } from './orden.entity';
import { ProductoEntity } from 'src/productos/entities/producto.entity';

@Entity('orden_items')
export class OrdenItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productoId: number;

  @Column()
  cantidad: number;

  @Column({ type: 'float' })
  precio: number;

  // Inversa correcta: (orden) => orden.items
  @ManyToOne(() => OrdenEntity, (orden) => orden.items, { onDelete: 'CASCADE' })
  orden: OrdenEntity;

  // Relación opcional con el producto (solo para obtener datos si hace falta)
  @ManyToOne(() => ProductoEntity, (producto) => producto.ordenes, { nullable: true })
  producto: ProductoEntity;
}
