import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdenesController } from './ordenes.controller';
import { OrdenesService } from './ordenes.service';
import { OrdenEntity } from './entities/orden.entity';
import { CarritoModule } from '../carrito/carrito.module';

@Module({
  imports: [TypeOrmModule.forFeature([OrdenEntity]), CarritoModule],
  controllers: [OrdenesController],
  providers: [OrdenesService],
  exports: [OrdenesService],
})
export class OrdenesModule {}
