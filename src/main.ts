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

  // Render utiliza HTTPS, habilitar CORS es vital
  app.enableCors();

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Rutas candidatas para el YAML
  const candidateYamlPaths = [
    join(process.cwd(), 'docs', 'api-docs.yaml'),
    join(__dirname, '..', 'docs', 'api-docs.yaml'),
    join(__dirname, '..', '..', 'docs', 'api-docs.yaml'),
  ];

  const yamlPath = candidateYamlPaths.find((p) => fs.existsSync(p));
  let yamlDoc: any | null = null;

  if (!yamlPath) {
    logger.warn(
      `No se encontró documento YAML en: ${candidateYamlPaths.join(', ')}`,
    );
  } else {
    try {
      const yamlContent = fs.readFileSync(yamlPath, 'utf8');
      yamlDoc = yaml.load(yamlContent) as any;

      if (!yamlDoc?.openapi || !yamlDoc?.info) {
        throw new Error('Documento YAML inválido: falta openapi/info.');
      }

      logger.log(`✅ Swagger YAML cargado desde: ${yamlPath}`);
    } catch (err: any) {
      logger.error(`❌ Error al leer YAML Swagger: ${err.message}`);
      yamlDoc = null;
    }
  }

  // Si no hay YAML, generar documentación por defecto
  if (!yamlDoc) {
    const config = new DocumentBuilder()
      .setTitle('API de Carrito y Órdenes')
      .setDescription(
        'Microservicio NestJS para gestionar carritos de compra y órdenes',
      )
      .setVersion('1.0.0')
      .addServer('/', 'Servidor actual')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/v1/docs', app, document);
  } else {
    // Usar el YAML directamente sin mezclar
    SwaggerModule.setup('api/v1/docs', app, yamlDoc, {
      swaggerOptions: {
        persistAuthorization: true,
        displayOperationId: false,
      },
      customSiteTitle: 'PulgaShop API',
    });
  }

  const port = process.env.PORT || 4000;

  await app.listen(port);

  logger.log(`🚀 Microservicio corriendo en puerto ${port}`);
  logger.log(
    `📖 Documentación disponible en: http://localhost:${port}/api/v1/docs`,
  );
}

bootstrap();
