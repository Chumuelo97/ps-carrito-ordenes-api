import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);
  constructor(private readonly dataSource: DataSource, private readonly config: ConfigService) {}

  async onModuleInit() {
    const runMigrations = this.config.get('DB_RUN_MIGRATIONS') === 'true';
    if (runMigrations) {
      this.logger.log('DB_RUN_MIGRATIONS=true → ejecutando migraciones TypeORM...');
      try {
        await this.dataSource.runMigrations();
        this.logger.log('Migraciones ejecutadas correctamente.');
      } catch (err) {
        this.logger.error('Error al ejecutar migraciones:', err as any);
      }
    } else {
      this.logger.log('DB_RUN_MIGRATIONS != true → no se ejecutan migraciones automáticas.');
    }
  }
}
