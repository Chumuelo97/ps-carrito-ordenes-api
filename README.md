# 🐳 API Carrito y Órdenes - NestJS con MySQL

Esta aplicación es un microservicio NestJS que maneja carritos de compra y órdenes, con base de datos MySQL.

## 🚀 Inicio Rápido con Docker (Recomendado)

La forma más fácil de ejecutar esta aplicación es usando Docker:

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd ps-carrito-ordenes-api

# Ejecutar con Docker Compose
docker-compose up --build

# La API estará disponible en: http://localhost:4010/api/v1/
```

### 🧪 Cargar Datos de Prueba
```bash
# Insertar datos de ejemplo para testing
./cargar-datos-prueba.sh

# Probar la API con ejemplos
./ejemplos-api.sh
```

📖 **[Ver Guía Completa de Docker →](README-DOCKER.md)**

## 🛠️ Instalación Manual (Alternativa)

Si prefieres ejecutar la aplicación sin Docker:

```bash
# Instalar dependencias
pnpm install

# Configurar variables de entorno (crear .env)
# Configurar base de datos MySQL manualmente

# Ejecutar en desarrollo
pnpm start:dev
```

# 📦 Diagrama de secuencias

<img width="1739" height="1791" alt="diagrama de secuencia ordenes y carrito" src="https://github.com/user-attachments/assets/a462deed-7ecf-49c2-85e3-c8c348439d3b" />

# 📦 Documentación de la Base de Datos
<img width="822" height="344" alt="Untitled" src="https://github.com/user-attachments/assets/659db177-92ff-4f20-b508-3fe557c51d08" />


**📖 Diccionario de Datos**

### Tabla: `carrito`
Almacena el estado actual de los carritos de compra de los usuarios. Los ítems se guardan de forma desnormalizada en una columna JSON (mapeada como `productos` en la BD).

| Campo                 | Tipo            | Restricciones                          | Descripción                                                                 |
| --------------------- | --------------- | -------------------------------------- | --------------------------------------------------------------------------- |
| `id`                  | INT             | PRIMARY KEY, AUTO_INCREMENT            | Identificador único del carrito.                                            |
| `comprador_id`        | VARCHAR(255)    | NOT NULL, INDEX                        | Identificador del usuario dueño del carrito.                                |
| `total`               | DECIMAL(12,2)   | NOT NULL, DEFAULT 0                    | Monto total acumulado de los productos en el carrito.                       |
| `productos`           | JSON (o TEXT)   | NULLABLE                               | Lista de productos en formato JSON (ej. `[{productoId: 1, cantidad: 2}]`). |
| `fecha_creacion`      | TIMESTAMP       | DEFAULT CURRENT_TIMESTAMP              | Fecha de creación del carrito.                                              |
| `fecha_actualizacion` | TIMESTAMP       | DEFAULT CURRENT_TIMESTAMP ON UPDATE... | Fecha de la última modificación del carrito.                                |

### Tabla: `ordenes`
Registra las órdenes de compra generadas a partir de un carrito. (Nombres de columnas en BD en snake_case.)

| Campo            | Tipo          | Restricciones                          | Descripción                                                 |
| ---------------- | ------------- | -------------------------------------- | ----------------------------------------------------------- |
| `id`             | INT           | PRIMARY KEY, AUTO_INCREMENT            | Identificador único de la orden.                            |
| `carrito_id`     | INT           | NOT NULL                               | ID del carrito asociado a esta orden.                       |
| `comprador_id`   | VARCHAR(255)  | NOT NULL                               | Identificador del comprador.                                |
| `estado_pago`    | ENUM          | NOT NULL, DEFAULT 'PENDIENTE'          | Estado del pago (`PENDIENTE`, `PAGADO`, `CANCELADO`).       |
| `total`          | DECIMAL(10,2) | NOT NULL                               | Monto final de la orden al momento de creación.             |
| `fecha_creacion` | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP              | Fecha y hora en que se generó la orden.                     |

---

**🔗 Relaciones y Estructura**

* **Relación Lógica:** `ordenes.carritoId` referencia a `carrito.id`.
* **Desnormalización:** A diferencia de un modelo tradicional relacional, este esquema no utiliza una tabla `carrito_items`. Los detalles de los productos se almacenan directamente en la columna `items` de la tabla `carrito` para simplificar la lectura y escritura rápida durante la sesión de compra.
* 
---

**📏 Restricciones de Integridad**  

1. ✅ Todas las órdenes deben tener un usuario asociado.  
2. ✅ Todas las órdenes deben tener un estado definido.  
3. ✅ Todas las órdenes deben tener un monto final calculado.  
4. ✅ Todos los ítems deben pertenecer a una orden existente.  
5. ✅ Todos los ítems deben tener un producto asociado.  
6. ✅ Todos los ítems deben registrar el precio de compra.  
7. ✅ No se permiten valores nulos en campos esenciales.  

---

**🔢 Tipos de Datos**  

- **INT**: Identificadores numéricos.  
- **VARCHAR(50)**: Texto de longitud variable (para estados).  
- **DECIMAL(10,2)**: Valores monetarios (10 dígitos totales, 2 decimales).  
- **DATETIME**: Fechas con hora.  




<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## 🐳 Docker Deployment (Recomendado)

Esta aplicación incluye configuración completa de Docker para desarrollo y producción:

### Inicio Rápido
```bash
# Ejecutar toda la aplicación (Backend + MySQL)
docker-compose up --build

# Ejecutar en segundo plano
docker-compose up --build -d

# Ver logs
docker-compose logs -f
```

### Servicios Disponibles
- **API Backend**: http://localhost:4010/api/v1/
- **MySQL**: localhost:3307 (root/rootpassword)

### Comandos Útiles
```bash
# Detener servicios
docker-compose down

# Reconstruir solo el backend
docker-compose up --build backend_carro_ordenes

# Conectar a MySQL
mysql -h 127.0.0.1 -P 3307 -u root -prootpassword ps_carrito_db
```

📖 **[Ver Guía Completa de Docker →](README-DOCKER.md)**

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:
