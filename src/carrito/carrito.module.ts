// src/carrito/carrito.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarritoEntity } from './entities/carrito.entity';
import { CarritoService } from './carrito.service';
import { CarritoController } from './carrito.controller';
import { CarritoItemEntity } from './entities/carrito-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CarritoEntity, CarritoItemEntity])],
  controllers: [CarritoController],
  providers: [CarritoService],
  exports: [CarritoService],
})
export class CarritoModule {}
