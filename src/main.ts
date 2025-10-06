import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Prefijo global para todas las rutas
  app.setGlobalPrefix('api/v1');

  // Habilita la validación automática de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuración de Swagger desde el archivo YAML
  const yamlPath = join(__dirname, '..', 'docs', 'documentacion-api.yaml');
  const yamlContent = fs.readFileSync(yamlPath, 'utf8');
  const document = yaml.load(yamlContent) as any;

  // Configuración adicional de Swagger
    const config = new DocumentBuilder()
      .setTitle(document.info.title)
      .setDescription(document.info.description)
      .setVersion(document.info.version)
      .setContact(document.info.contact?.name || '', '', '');

    if (document.info.license && document.info.license.name) {
      config.setLicense(document.info.license.name, '');
    }

    config
      .addServer(document.servers[0].url, document.servers[0].description)
      .addTag('Carrito', 'Operaciones relacionadas con el carrito de compras')
      .addTag(
        'Órdenes',
        'Operaciones relacionadas con la creación y visualización de órdenes',
      )
      .build();

  // Creamos la documentación Swagger
  SwaggerModule.setup('api/v1/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Microservicio de Carrito corriendo en el puerto ${port}`);
  logger.log(
    `📚 Documentación Swagger disponible en http://localhost:${port}/api/v1/docs`,
  );
}

bootstrap();
