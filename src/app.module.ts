import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarritoModule } from './carrito/carrito.module';
import { ConfigModule } from '@nestjs/config';
import { OrdenesModule } from './ordenes/ordenes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '3306', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    CarritoModule,
    OrdenesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
