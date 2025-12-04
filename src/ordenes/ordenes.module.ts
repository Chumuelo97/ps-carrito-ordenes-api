import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdenesController } from './ordenes.controller';
import { OrdenesService } from './ordenes.service';
import { OrdenEntity } from './entities/orden.entity';
import { OrdenItemEntity } from './entities/orden-item.entity';
import { CarritoModule } from '../carrito/carrito.module';
import { CarritoEntity } from 'src/carrito/entities/carrito.entity';
import { ProductosModule } from '../productos/productos.module';  // ← IMPORTAR

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrdenEntity,
      OrdenItemEntity,
      CarritoEntity,
    ]),
    CarritoModule,
    ProductosModule,  // ← AÑADIR ESTO
  ],
  controllers: [OrdenesController],
  providers: [OrdenesService],
  exports: [OrdenesService],
})
export class OrdenesModule {}
