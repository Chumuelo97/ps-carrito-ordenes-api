import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Order } from './order.entity';

function decimalTransformer() {
  return {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value),
  };
}

@Entity({ name: 'order_items' })
@Index(['id_producto'])
export class OrderItem {
  @PrimaryColumn({ name: 'id_order', type: 'int' })
  id_order: number;

  @ManyToOne(() => Order, (order) => order.items, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_order' })
  order: Order;

  @PrimaryColumn({ name: 'id_producto', type: 'int' })
  id_producto: number;
  @Column({ name: 'cantidad', type: 'int', default: 1 })
  cantidad: number;

  @Column({ name: 'precio', type: 'decimal', precision: 10, scale: 2, transformer: decimalTransformer() })
  precio: number;
}
