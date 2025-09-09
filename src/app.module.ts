import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CarritoModule } from './carrito/carrito.module';

@Module({
  imports: [CarritoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
