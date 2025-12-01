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

  // CORRECCIÓN 1: Ruta robusta para encontrar el YAML tanto en dev como en prod
  // En producción, __dirname apuntará a /dist/src, por lo que subimos dos niveles
  // para llegar a /dist y luego entramos a /docs
  const candidateYamlPaths = [
    join(process.cwd(), 'docs', 'documentacion-api.yaml'),
    join(__dirname, '..', 'docs', 'documentacion-api.yaml'),
    join(__dirname, '..', '..', 'docs', 'documentacion-api.yaml'),
  ];

  const yamlPath = candidateYamlPaths.find((path) => fs.existsSync(path));

  // Fallback por si la estructura de carpetas varía (útil para debug)
  if (!yamlPath) {
    logger.error(
      `No se encontró el archivo Swagger. Intentos: ${candidateYamlPaths.join(', ')}`,
    );
  } else {
    const yamlContent = fs.readFileSync(yamlPath, 'utf8');
    const document = yaml.load(yamlContent) as any;

    const config = new DocumentBuilder()
      .setTitle(document.info.title)
      .setDescription(document.info.description)
      .setVersion(document.info.version)
      .setContact(document.info.contact?.name || '', '', '');

    // CORRECCIÓN 2: Limpiar servidores hardcodeados
    // Esto permite que Swagger use la URL actual (HTTPS en Render) automáticamente
    config.addServer('/', 'Servidor Actual');

    const builtConfig = config.build();

    // Mezclar tu YAML con la configuración generada
    const combinedDocumentsq = {
      ...document,
      ...SwaggerModule.createDocument(app, builtConfig),
    };

    SwaggerModule.setup('api/v1/docs', app, combinedDocumentsq);
  }

  const port = process.env.PORT || 3001;

  // CORRECCIÓN 3: Escuchar en 0.0.0.0 para Render
  await app.listen(port);

  logger.log(`🚀 Microservicio corriendo en puerto ${port}`);
}

bootstrap();
