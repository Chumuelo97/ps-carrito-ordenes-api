import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { OrdenItemEntity } from '../../ordenes/entities/orden-item.entity';

@Entity('productos')
export class ProductoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  precio: number;

  @Column()
  stock: number;

  @OneToMany(() => OrdenItemEntity, (item) => item.producto)
  ordenes: OrdenItemEntity[];
}
