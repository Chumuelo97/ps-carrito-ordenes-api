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

  // Rutas candidatas (soporta dev y prod). Incluye nombres alternativos por si el archivo cambia de nombre.
  const candidateYamlPaths = [
    join(process.cwd(), 'docs', 'documentacionapi.yaml'),
    join(__dirname, '..', 'docs', 'documentacionapi.yaml'),
    join(__dirname, '..', '..', 'docs', 'documentacionapi.yaml'),
    // nombres alternativos conocidos
    join(process.cwd(), 'docs', 'documentacion-api.yaml'),
    join(__dirname, '..', 'docs', 'documentacion-api.yaml'),
    join(__dirname, '..', '..', 'docs', 'documentacion-api.yaml'),
  ];
  
  const yamlPath = candidateYamlPaths.find((p) => fs.existsSync(p));
  let yamlDoc: any | null = null;
  if (!yamlPath) {
    logger.warn(
      `No se encontró documento YAML. Intentos: ${candidateYamlPaths.join(', ')}`,
    );
  } else {
    try {
      const yamlContent = fs.readFileSync(yamlPath, 'utf8');
      yamlDoc = yaml.load(yamlContent) as any;
      if (!yamlDoc?.openapi || !yamlDoc?.info) {
        throw new Error('Documento YAML inválido: falta openapi/info.');
      }
      logger.log(`Swagger YAML cargado desde: ${yamlPath}`);
    } catch (err: any) {
      logger.error(`Error al leer YAML Swagger: ${err.message}`);
      yamlDoc = null;
    }
  }

  // Config base generada por Nest (para complementar si faltan partes en el YAML)
  const builder = new DocumentBuilder()
    .setTitle(yamlDoc?.info?.title ?? 'API PulgaShop')
    .setDescription(yamlDoc?.info?.description ?? 'Documentación de la API')
    .setVersion(yamlDoc?.info?.version ?? '1.0.0');

  // Servidor por defecto si el YAML no define servers
  builder.addServer('/', 'Servidor actual');

  const builtConfig = builder.build();
  const generated = SwaggerModule.createDocument(app, builtConfig);

  // Mezclar el documento YAML (si existe) con lo generado por Nest.
  // Se prioriza el contenido del YAML.
  const finalDoc = yamlDoc
    ? {
        ...generated,
        ...yamlDoc,
        info: {
          ...(generated as any).info,
          ...(yamlDoc.info ?? {}),
        },
        servers: yamlDoc.servers ??
          (generated as any).servers ?? [
            { url: '/', description: 'Servidor actual' },
          ],
        components: {
          ...((generated as any).components ?? {}),
          ...((yamlDoc as any).components ?? {}),
        },
        paths: {
          ...((generated as any).paths ?? {}),
          ...((yamlDoc as any).paths ?? {}),
        },
      }
    : generated;

  SwaggerModule.setup('api/v1/docs', app, finalDoc);

  const port = process.env.PORT || 3001;

  await app.listen(port);

  logger.log(`🚀 Microservicio corriendo en puerto ${port}`);
}

bootstrap();
