# 🐳 Guía de Docker - API Carrito y Órdenes

Esta guía te ayudará a ejecutar la aplicación NestJS con MySQL utilizando Docker y Docker Compose.

## Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- [Docker](https://docs.docker.com/get-docker/) (versión 20.10 o superior)
- [Docker Compose](https://docs.docker.com/compose/install/) (incluido con Docker Desktop)

### Verificar instalación:
```bash
docker --version
docker-compose --version
```

## Inicio Rápido

### 1. Clonar y navegar al directorio del proyecto
```bash
git clone <url-del-repositorio>
cd ps-carrito-ordenes-api
```

### 2. Ejecutar con Docker Compose (Recomendado)
```bash
# Construir y ejecutar todos los servicios
docker-compose up --build

# O ejecutar en segundo plano
docker-compose up --build -d
```

La aplicación estará disponible en:
- **API**: http://localhost:4010/api/v1/
- **MySQL**: localhost:3307

## Servicios Incluidos

### Backend (NestJS)
- **Puerto**: 4010
- **Contenedor**: `backend_grupo5`
- **Imagen**: Construida desde Dockerfile local
- **Variables de entorno**: Configuradas automáticamente

### Base de Datos (MySQL 8.0)
- **Puerto externo**: 3307 (para evitar conflictos con MySQL local)
- **Puerto interno**: 3306
- **Contenedor**: `mysql_grupo5`
- **Base de datos**: `ps_carrito_db`
- **Usuario root**: `root` / `rootpassword`
- **Usuario aplicación**: `app_user` / `app_password`

## Estructura de Archivos Docker

```
ps-carrito-ordenes-api/
├── dockerfile              # Imagen del backend NestJS
├── docker-compose.yml      # Orquestación de servicios
└── script/
    └── init_db.sql         # Script de inicialización de BD
```

## Comandos Útiles

### Gestión de Servicios
```bash
# Iniciar todos los servicios
docker-compose up

# Iniciar en segundo plano
docker-compose up -d

# Reconstruir las imágenes y iniciar
docker-compose up --build

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes ( ELIMINA DATOS)
docker-compose down -v
```

### Logs y Debugging
```bash
# Ver logs de todos los servicios
docker-compose logs

# Ver logs en tiempo real
docker-compose logs -f

# Logs de un servicio específico
docker-compose logs backend_carro_ordenes
docker-compose logs db_sql

# Ver logs de las últimas 100 líneas
docker-compose logs --tail=100
```

### Gestión Individual de Contenedores
```bash
# Reiniciar solo el backend
docker-compose restart backend_carro_ordenes

# Reconstruir solo el backend
docker-compose up --build backend_carro_ordenes

# Ejecutar comandos dentro del contenedor
docker-compose exec backend_carro_ordenes sh
docker-compose exec db_sql mysql -u root -p
```

## Verificación y Testing

### Probar la API
```bash
# Verificar que la API responde
curl http://localhost:4010/api/v1/carrito/obtenerCarritos

# Crear un carrito de prueba
curl -X POST http://localhost:4010/api/v1/carrito/crearCarrito \
  -H "Content-Type: application/json" \
  -d '{"compradorId": "123", "productos": []}'
```

### Conectar a MySQL
```bash
# Desde el host
mysql -h 127.0.0.1 -P 3307 -u root -prootpassword ps_carrito_db

# Desde el contenedor
docker-compose exec db_sql mysql -u root -prootpassword ps_carrito_db
```

### Verificar tablas creadas
```bash
mysql -h 127.0.0.1 -P 3307 -u root -prootpassword ps_carrito_db -e "SHOW TABLES;"
```

## Solución de Problemas

### Puerto en uso
Si el puerto 4010 o 3307 ya están en uso:
```bash
# Verificar qué procesos usan los puertos
lsof -i :4010
lsof -i :3307

# Cambiar puertos en docker-compose.yml si es necesario
```

### Problemas de conexión a la base de datos
```bash
# Verificar que MySQL esté saludable
docker-compose ps

# Revisar logs de MySQL
docker-compose logs db_sql

# Reiniciar solo la base de datos
docker-compose restart db_sql
```

### Limpiar todo y empezar de nuevo
```bash
# Detener y eliminar todo (contenedores, redes, volúmenes)
docker-compose down -v

# Eliminar imágenes construidas
docker rmi ps-carrito-ordenes-api-backend_carro_ordenes

# Volver a construir todo
docker-compose up --build
```

## Configuración Avanzada

### Variables de Entorno
Las siguientes variables están configuradas automáticamente:

**Backend:**
- `PORT=4010`
- `DB_HOST=db_sql`
- `DB_PORT=3306`
- `DB_USERNAME=root`
- `DB_PASSWORD=rootpassword`
- `DB_DATABASE=ps_carrito_db`

**MySQL:**
- `MYSQL_ROOT_PASSWORD=rootpassword`
- `MYSQL_DATABASE=ps_carrito_db`
- `MYSQL_USER=app_user`
- `MYSQL_PASSWORD=app_password`

### Personalizar Configuración
Para modificar la configuración, edita el archivo `docker-compose.yml`:

```yaml
environment:
  - PORT=4010                    # Cambiar puerto del backend
  - DB_PASSWORD=nuevapassword    # Cambiar contraseña de BD
```

## Endpoints Disponibles

Una vez que la aplicación esté ejecutándose, los siguientes endpoints estarán disponibles:

### Carrito
- `GET /api/v1/carrito/obtenerCarritos` - Obtener todos los carritos
- `GET /api/v1/carrito/obtenerCarro/:id` - Obtener carrito por ID
- `POST /api/v1/carrito/crearCarrito` - Crear nuevo carrito
- `POST /api/v1/carrito/agregarProductos` - Agregar productos al carrito
- `DELETE /api/v1/carrito/eliminarProducto` - Eliminar producto del carrito
- `DELETE /api/v1/carrito/eliminarCarrito` - Eliminar carrito

### Órdenes
- `POST /api/v1/ordenes/checkout/:carritoId` - Procesar orden
- `GET /api/v1/ordenes/estado-pago/:carritoId` - Estado del pago
- `GET /api/v1/ordenes/historial/:compradorId` - Historial de órdenes
- `GET /api/v1/ordenes/estadisticas/producto/:productoId` - Estadísticas de producto

##  Próximos Pasos

1. **Desarrollo**: Modifica el código fuente y ejecuta `docker-compose up --build` para ver los cambios
2. **Testing**: Usa las rutas de la API para probar la funcionalidad
3. **Monitoreo**: Revisa los logs con `docker-compose logs -f`
4. **Producción**: Considera usar un archivo `docker-compose.prod.yml` para producción

## 🧪 Datos de Prueba

Para facilitar el testing, hemos incluido scripts que insertan datos de ejemplo en la base de datos:

### Cargar Datos de Prueba
```bash
# Ejecutar después de que los contenedores estén funcionando
./cargar-datos-prueba.sh
```

Este script insertará:
- **5 carritos de prueba** con diferentes productos y usuarios
- **3 órdenes de ejemplo** en diferentes estados (PAGADO, PENDIENTE)
- **Productos variados** incluyendo laptops, periféricos, y accesorios

### Probar la API
```bash
# Ejecutar ejemplos de requests a la API
./ejemplos-api.sh

# O ejecutar requests individuales
curl http://localhost:4010/api/v1/carrito/obtenerCarritos
curl http://localhost:4010/api/v1/ordenes/historial/user001
```

### Datos Incluidos
Los datos de prueba incluyen:

**Usuarios:**
- `user001` - 2 carritos, 1 orden pagada
- `user002` - 1 carrito, 1 orden pendiente  
- `user003` - 1 carrito, 1 orden pagada
- `user004` - 1 carrito vacío

**Productos de ejemplo (precios en pesos chilenos CLP):**
- Laptop Gaming ($850.000)
- Mouse Inalámbrico ($22.000)
- Teclado Mecánico ($65.000)
- Monitor 24" ($295.000)
- Auriculares Bluetooth ($85.000)
- Webcam HD ($75.000)
- Cable HDMI ($18.500)
- Soporte Monitor ($97.450)
- Cargador USB-C ($20.500)
- Mousepad ($13.500)

### Verificar Datos Cargados
```bash
# Conectar a MySQL y verificar
mysql -h 127.0.0.1 -P 3307 -u root -prootpassword ps_carrito_db

# Ver carritos
SELECT id, comprador_id, total, JSON_LENGTH(productos) as num_productos FROM carrito;

# Ver órdenes
SELECT id, comprador_id, estado_pago, total FROM ordenes;
```

## 📞 Soporte

