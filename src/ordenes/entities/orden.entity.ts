import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { OrdenItemEntity } from './orden-item.entity';
import { OrdenStatus } from '../orden-status.enum';

@Entity('ordenes')
export class OrdenEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  compradorId: string;

  @Column({ type: 'float' })
  total: number;

  @Column({ type: 'enum', enum: OrdenStatus, default: OrdenStatus.PENDIENTE })
  estadoPago: OrdenStatus;

  @CreateDateColumn()
  fecha: Date;

  // Usamos "items" (coherente con orden-item.entity.ts)
  @OneToMany(() => OrdenItemEntity, (item) => item.orden, { cascade: true, eager: true })
  items: OrdenItemEntity[];
}
