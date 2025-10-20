import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

function decimalTransformer() {
  return {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value),
  };
}

@Entity({ name: 'orders' })
@Index(['id_usuario'])
export class Order {
  @PrimaryGeneratedColumn({ name: 'id_order' })
  id: number;

  @Column({ name: 'id_usuario', type: 'int' })
  id_usuario: number;

  @Column({ name: 'estado', type: 'varchar', length: 50, default: 'pending' })
  estado: string;

  @Column({
    name: 'monto_final',
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer(),
    default: 0,
  })
  monto_final: number;

  @CreateDateColumn({ name: 'fecha' })
  fecha: Date;

  @OneToMany(() => OrderItem, (item: OrderItem) => item.order, { cascade: true, eager: true })
  items: OrderItem[];
}
