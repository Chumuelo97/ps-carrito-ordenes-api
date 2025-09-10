import { Module } from '@nestjs/common';
import { CartModule } from './modules/cart/cart.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // Módulo para gestionar variables de entorno (.env)
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Importamos el módulo principal de nuestra lógica de negocio
    CartModule,
  ],
  controllers: [],
  providers: [],

})
export class AppModule {}
