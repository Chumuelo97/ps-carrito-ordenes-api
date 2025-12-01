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

  const candidateYamlPaths = [
    join(process.cwd(), 'docs', 'documentacionapi.yaml'),
    join(__dirname, '..', 'docs', 'documentacionapi.yaml'),
    join(__dirname, '..', '..', 'docs', 'documentacionapi.yaml'),
  ];

  const yamlPath = candidateYamlPaths.find((path) => fs.existsSync(path));

  // Fallback por si la estructura de carpetas varía (útil para debug)
  let swaggerDoc: any = null;
  if (yamlPath) {
    try {
      const yamlContent = fs.readFileSync(yamlPath, 'utf8');
      const parsed = yaml.load(yamlContent) as any;
      if (!parsed || !parsed.info) {
        throw new Error('Estructura YAML inválida (falta info).');
      }
      swaggerDoc = parsed;
    } catch (err: any) {
      logger.error(`Error al cargar YAML Swagger: ${err.message}`);
    }
  } else {
    logger.warn(
      `No se encontró archivo YAML. Intentos: ${candidateYamlPaths.join(', ')}`,
    );
  }

  const builder = new DocumentBuilder()
    .setTitle(swaggerDoc?.info?.title || 'API PulgaShop')
    .setDescription(
      swaggerDoc?.info?.description ||
        'Documentación generada por Nest (fallback).',
    )
    .setVersion(swaggerDoc?.info?.version || '1.0.0')
    .setContact(swaggerDoc?.info?.contact?.name || 'Equipo', '', '');

  builder.addServer('/', 'Servidor Actual');

  const builtConfig = builder.build();
  const generated = SwaggerModule.createDocument(app, builtConfig);
  const finalDoc = swaggerDoc
    ? { ...swaggerDoc, paths: { ...swaggerDoc.paths, ...generated.paths } }
    : generated;

  SwaggerModule.setup('api/v1/docs', app, finalDoc);

  const port = process.env.PORT || 3001;

  await app.listen(port);

  logger.log(`🚀 Microservicio corriendo en puerto ${port}`);
}

bootstrap();
