import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrdenItemEntity } from './orden-item.entity';
import { CarritoEntity } from 'src/carrito/entities/carrito.entity';

@Entity('ordenes')
export class OrdenEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  compradorId: string;

  @Column()
  total: number;

  @Column()
  estadoPago: string;

  @ManyToOne(() => CarritoEntity, (carrito) => carrito.ordenes)
  carrito: CarritoEntity;

  @OneToMany(() => OrdenItemEntity, (item) => item.orden, { cascade: true })
  items: OrdenItemEntity[];

  @CreateDateColumn()
  fecha: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
