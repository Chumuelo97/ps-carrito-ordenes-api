// src/carrito/entities/carrito.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('carrito')
export class CarritoEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('varchar', { length: 255 })
  compradorId: string;

  /*Falta id_producto, agregarlo a la base de datos 
  @Column('int')
  productoId: number;
  */
  @Column('decimal', { precision: 10, scale: 0 })
  total: number;
}
