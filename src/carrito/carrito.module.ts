// src/carrito/carrito.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarritoEntity } from './entities/carrito.entity';
import { CarritoService } from './carrito.service';

@Module({
  imports: [TypeOrmModule.forFeature([CarritoEntity])],
  providers: [CarritoService],
  exports: [CarritoService],
})
export class CarritoModule {}
