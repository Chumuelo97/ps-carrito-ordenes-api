import { Module } from '@nestjs/common';
import { CartModule } from './modules/cart/cart.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule } from './modules/orders/orders.module';
import { DatabaseModule } from './modules/database/database.module';
import { Order } from './modules/orders/entities/order.entity';
import { OrderItem } from './modules/orders/entities/order-item.entity';

@Module({
  imports: [
    // Módulo para gestionar variables de entorno (.env)
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Configuración de TypeORM (MySQL)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST') || 'localhost',
        port: Number(config.get('DB_PORT') || 3306),
        username: config.get('DB_USER') || 'root',
        password: config.get('DB_PASS') || '',
        database: config.get('DB_NAME') || 'ps_carrito',
  // Register entities explicitly to avoid picking up legacy/unused entity files
  entities: [Order, OrderItem],
        synchronize: config.get('DB_SYNC') === 'true' ? true : false, // controlar vía .env (solo dev)
      }),
    }),
    // Importamos módulos de la aplicación
    CartModule,
    OrdersModule,
    // DatabaseModule controla la ejecución opcional de migraciones (ver DB_RUN_MIGRATIONS)
    DatabaseModule,
  ],
  controllers: [],
  providers: [],

})
export class AppModule {}
