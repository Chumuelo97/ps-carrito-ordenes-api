// src/carrito/entities/carrito.entity.ts (Modificado)
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CarritoItemEntity } from './carrito-item.entity'; // <--- Importar la nueva entidad

@Entity('carrito')
export class CarritoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 255 })
  compradorId: string;

  @Column('decimal', { precision: 10, scale: 0 })
  total: number;

  // Un carrito tiene MUCHOS items.
  @OneToMany(() => CarritoItemEntity, (item) => item.carrito, { cascade: true })
  items: CarritoItemEntity[]; // <--- Ahora es un array de la entidad real
}
