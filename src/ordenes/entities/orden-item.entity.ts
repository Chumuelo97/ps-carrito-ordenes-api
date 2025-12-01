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

  @Column()
  precio: number;

  @ManyToOne(() => OrdenEntity, (orden) => orden.items)
  orden: OrdenEntity;

  @ManyToOne(() => ProductoEntity, (producto) => producto.items)
  producto: ProductoEntity;
}
