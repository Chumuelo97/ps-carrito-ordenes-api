# 🛒 PulgaShop - Carrito de Órdenes API

**Sistema de carrito de compras y gestión de órdenes desarrollado con NestJS, Next.js y MySQL**

---

## 📋 Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Instalación y Configuración](#instalación-y-configuración)
4. [Ejecución del Sistema](#ejecución-del-sistema)
5. [Verificación de Servicios](#verificación-de-servicios)
6. [URLs de Acceso](#urls-de-acceso)
7. [API Endpoints](#api-endpoints)
8. [Base de Datos](#base-de-datos)
9. [Troubleshooting](#troubleshooting)
10. [Estructura del Proyecto](#estructura-del-proyecto)

---

## 🔧 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Docker Desktop** v4.0+
- **Docker Compose** v2.0+
- **Git**
- **Terminal/CMD** con acceso a `curl` (para pruebas)

### Verificar Instalación

```bash
docker --version
docker-compose --version
git --version
```

---

## 🏗️ Arquitectura del Sistema

El sistema está compuesto por 4 servicios principales:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │    │                 │
│    NGINX        │    │   FRONTEND      │    │    BACKEND      │    │     MySQL       │
│  (Puerto 80)    │───▶│ Next.js (6969)  │───▶│ NestJS (4010)   │───▶│   (Puerto 3307) │
│                 │    │                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Servicios

| Servicio | Tecnología | Puerto Interno | Puerto Externo | Función |
|----------|------------|----------------|----------------|---------|
| **nginx** | NGINX 1.25 | 80 | 80 | Reverse Proxy |
| **frontend** | Next.js 16 | 6969 | - | Interfaz de Usuario |
| **backend** | NestJS | 4010 | 4010 | API REST |
| **database** | MySQL 8.0 | 3306 | 3307 | Base de Datos |

---

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd ps-carrito-ordenes-api
```

### 2. Verificar Estructura

Asegúrate de que tienes esta estructura de directorios:

```
.
├── ps-carrito-ordenes-api/     # Backend NestJS + Docker Compose
│   ├── docker-compose.yml
│   ├── dockerfile
│   ├── nginx/
│   │   └── nginx.config
│   └── src/
└── pulga-shop-frontend/        # Frontend Next.js
    ├── dockerfile
    ├── package.json
    └── app/
```

---

## ▶️ Ejecución del Sistema

### Opción 1: Inicio Completo (Recomendado)

```bash
# Navegar al directorio principal
cd ps-carrito-ordenes-api

# Construir e iniciar todos los servicios
docker-compose up --build
```

### Opción 2: Ejecución en Background

```bash
# Iniciar en segundo plano
docker-compose up --build -d

# Ver logs en tiempo real
docker-compose logs -f
```

### Opción 3: Reconstrucción Completa

```bash
# Detener y limpiar contenedores existentes
docker-compose down --volumes --remove-orphans

# Limpiar imágenes (opcional)
docker system prune -f

# Reconstruir desde cero
docker-compose up --build
```

---

## ✅ Verificación de Servicios

### 1. Verificar Estado de Contenedores

```bash
docker-compose ps
```

**Salida Esperada:**
```
NAME              COMMAND                  SERVICE               STATUS          PORTS
backend_grupo5    "dumb-init node dist…"   backend_carro_orden   Up 2 minutes    0.0.0.0:4010->4010/tcp
frontend_grupo5   "docker-entrypoint.s…"   frontend_carro_orde   Up 2 minutes    0.0.0.0:6969->6969/tcp
mysql_grupo5      "docker-entrypoint.s…"   db_sql                Up 2 minutes    0.0.0.0:3307->3306/tcp
nginx_proxy       "/docker-entrypoint.…"   nginx                 Up 2 minutes    0.0.0.0:80->80/tcp
```

### 2. Health Check de Base de Datos

```bash
# Verificar conexión a MySQL
docker exec mysql_grupo5 mysqladmin ping -h localhost -u root -prootpassword
```

**Respuesta esperada:** `mysqld is alive`

### 3. Prueba de API Backend

```bash
# Verificar productos externos
curl http://localhost:4010/api/v1/carrito/productos-externos

# Verificar documentación Swagger
curl -I http://localhost:4010/api
```

### 4. Prueba de Frontend

```bash
# Verificar frontend directo
curl -I http://localhost:6969

# Verificar a través de NGINX
curl -I http://localhost/pulga-shop/
```

---

## 🌐 URLs de Acceso

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Aplicación Principal** | http://localhost/pulga-shop/ | Interfaz de usuario principal |
| **Carrito de Compras** | http://localhost/pulga-shop/cart | Página del carrito |
| **API Documentation** | http://localhost:4010/api | Swagger UI |
| **Backend API** | http://localhost:4010/api/v1/ | Endpoints de la API |
| **Frontend Directo** | http://localhost:6969 | Acceso directo al frontend |
| **MySQL (Externo)** | localhost:3307 | Conexión directa a BD |

---

## 📡 API Endpoints

### Carrito

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/carrito/obtenerCarritos` | Obtener todos los carritos |
| GET | `/carrito/obtenerCarro/{id}` | Obtener carrito por ID |
| POST | `/carrito/crearCarrito` | Crear nuevo carrito |
| POST | `/carrito/agregarProductos` | Agregar productos al carrito |
| DELETE | `/carrito/eliminarProductos` | Eliminar productos del carrito |
| DELETE | `/carrito/eliminarCarrito` | Eliminar carrito completo |
| GET | `/carrito/productos-externos` | Obtener productos de API externa |

### Órdenes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/ordenes/checkout/{carritoId}` | Procesar checkout de carrito |
| GET | `/ordenes/estado-pago/{carritoId}` | Obtener estado de pago |
| GET | `/ordenes/historial/{compradorId}` | Historial de órdenes |

### Ejemplos de Uso

```bash
# Crear un carrito
curl -X POST http://localhost:4010/api/v1/carrito/crearCarrito \
  -H "Content-Type: application/json" \
  -d '{"compradorId": "user001"}'

# Agregar producto al carrito
curl -X POST http://localhost:4010/api/v1/carrito/agregarProductos \
  -H "Content-Type: application/json" \
  -d '{
    "compradorId": "user001",
    "productos": [
      {"productoId": "prod001", "nombre": "Producto Test", "precio": 15000, "cantidad": 2}
    ]
  }'

# Ver carrito
curl http://localhost:4010/api/v1/carrito/obtenerCarritos
```

---

## 🗄️ Base de Datos

### Conexión Directa

```bash
# Conexión desde terminal
mysql -h 127.0.0.1 -P 3307 -u root -prootpassword ps_carrito_db

# O usando Docker
docker exec -it mysql_grupo5 mysql -u root -prootpassword ps_carrito_db
```

### Credenciales

- **Host:** localhost
- **Puerto:** 3307
- **Usuario:** root
- **Contraseña:** rootpassword
- **Base de Datos:** ps_carrito_db

### Esquema Principal

- **carrito_entity**: Carritos de compras
- **orden_entity**: Órdenes de compra

---

## 🔍 Troubleshooting

### Problema: Contenedores no inician

```bash
# Verificar logs
docker-compose logs [nombre_servicio]

# Ejemplo específico
docker-compose logs backend_carro_ordenes
```

### Problema: Puerto ya en uso

```bash
# Verificar procesos usando puertos
lsof -i :80
lsof -i :3307
lsof -i :4010
lsof -i :6969

# Detener procesos si es necesario
docker-compose down
```

### Problema: Error de permisos

```bash
# En macOS/Linux, asegurar permisos
chmod +x script/sh/*.sh

# Reconstruir sin cache
docker-compose build --no-cache
```

### Problema: Base de datos no responde

```bash
# Reiniciar solo la base de datos
docker-compose restart db_sql

# Verificar logs de MySQL
docker-compose logs db_sql
```

### Problema: Frontend no carga

```bash
# Verificar configuración de NGINX
docker exec nginx_proxy cat /etc/nginx/conf.d/default.conf

# Verificar logs de NGINX
docker-compose logs nginx
```

### Limpiar Todo y Reiniciar

```bash
# Parar todos los servicios
docker-compose down

# Limpiar volúmenes (¡CUIDADO: Borra datos de BD!)
docker-compose down --volumes

# Limpiar imágenes
docker system prune -a

# Reiniciar desde cero
docker-compose up --build
```

---

## 📁 Estructura del Proyecto

```
ps-carrito-ordenes-api/
├── 📄 docker-compose.yml          # Orquestación de servicios
├── 📄 dockerfile                  # Imagen del backend
├── 📁 nginx/
│   └── nginx.config               # Configuración reverse proxy
├── 📁 src/                        # Código fuente backend
│   ├── app.module.ts
│   ├── main.ts
│   ├── carrito/                   # Módulo de carritos
│   └── ordenes/                   # Módulo de órdenes
├── 📁 script/
│   ├── init_db.sql               # Script inicial de BD
│   └── sh/                       # Scripts de utilidad
└── 📁 docs/                      # Documentación

pulga-shop-frontend/
├── 📄 dockerfile                  # Imagen del frontend
├── 📄 next.config.ts             # Configuración Next.js
├── 📁 app/
│   ├── page.js                   # Página principal
│   ├── cart/page.js             # Página del carrito
│   └── api/                     # API routes
└── 📁 components/               # Componentes React
```

---

## 🚦 Checklist de Integración

- [ ] Docker Desktop instalado y funcionando
- [ ] Repositorio clonado correctamente
- [ ] Estructura de directorios verificada
- [ ] `docker-compose up --build` ejecutado sin errores
- [ ] Todos los servicios en estado "Up"
- [ ] Frontend accesible en http://localhost/pulga-shop/
- [ ] API documentation accesible en http://localhost:4010/api
- [ ] Base de datos respondiendo en puerto 3307
- [ ] Pruebas de API endpoints exitosas

---

## 📞 Soporte

Si encuentras algún problema durante la integración:

1. Revisa la sección [Troubleshooting](#troubleshooting)
2. Verifica los logs con `docker-compose logs [servicio]`
3. Asegúrate de que todos los puertos estén libres
4. Contacta al equipo de desarrollo con los logs específicos del error

---

**¡Sistema listo para integración! 🎉**

> **Nota:** Este README está actualizado al 9 de diciembre de 2025. Asegúrate de tener la versión más reciente del código.
