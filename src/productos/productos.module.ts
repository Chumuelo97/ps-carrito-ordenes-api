import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoEntity } from './entities/producto.entity';
import { ProductosService } from './productos.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductoEntity])],
  providers: [ProductosService],
  exports: [ProductosService], // <-- Importante
})
export class ProductosModule {}
