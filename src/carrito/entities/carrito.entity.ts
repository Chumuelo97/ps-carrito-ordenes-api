import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { OrdenEntity } from 'src/ordenes/entities/orden.entity';

@Entity('carritos')
export class CarritoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  compradorId: string;

  @Column({ type: 'json' })
  items: {
    productoId: number;
    cantidad: number;
    precio: number;
  }[];

  @OneToMany(() => OrdenEntity, (orden) => orden.carrito)
  ordenes: OrdenEntity[];

  @Column({ type: 'float', default: 0 })
  total: number;

}
