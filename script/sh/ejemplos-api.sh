# Ejemplos de Testing para la API
# Ejecutar después de cargar los datos de prueba

# ========================================
# ENDPOINTS DE CARRITO
# ========================================

# 1. Obtener todos los carritos
curl -X GET http://localhost:4010/api/v1/carrito/obtenerCarritos

# 2. Obtener carrito específico por ID
curl -X GET http://localhost:4010/api/v1/carrito/obtenerCarro/1
curl -X GET http://localhost:4010/api/v1/carrito/obtenerCarro/3

# 3. Crear un nuevo carrito
curl -X POST http://localhost:4010/api/v1/carrito/crearCarrito \
  -H "Content-Type: application/json" \
  -d '{
    "compradorId": "user999",
    "productos": []
  }'

# 4. Agregar productos a un carrito
curl -X POST http://localhost:4010/api/v1/carrito/agregarProductos \
  -H "Content-Type: application/json" \
  -d '{
    "carritoId": 5,
    "productos": [
      {
        "productoId": "prod011",
        "nombre": "SSD 1TB",
        "precio": 120.00,
        "cantidad": 1
      },
      {
        "productoId": "prod012",
        "nombre": "RAM 16GB",
        "precio": 80.00,
        "cantidad": 2
      }
    ]
  }'

# 5. Eliminar producto del carrito
curl -X DELETE http://localhost:4010/api/v1/carrito/eliminarProducto \
  -H "Content-Type: application/json" \
  -d '{
    "carritoId": 1,
    "productoId": "prod002"
  }'

# 6. Eliminar carrito completo
curl -X DELETE http://localhost:4010/api/v1/carrito/eliminarCarrito \
  -H "Content-Type: application/json" \
  -d '{
    "carritoId": 5
  }'

# ========================================
# 📦 ENDPOINTS DE ÓRDENES
# ========================================

# 7. Hacer checkout de un carrito
curl -X POST http://localhost:4010/api/v1/ordenes/checkout/2

# 8. Obtener estado de pago de un carrito
curl -X GET http://localhost:4010/api/v1/ordenes/estado-pago/1
curl -X GET http://localhost:4010/api/v1/ordenes/estado-pago/2

# 9. Obtener historial de órdenes de un comprador
curl -X GET http://localhost:4010/api/v1/ordenes/historial/user001
curl -X GET http://localhost:4010/api/v1/ordenes/historial/user002
curl -X GET http://localhost:4010/api/v1/ordenes/historial/user003

# 10. Obtener estadísticas de un producto
curl -X GET http://localhost:4010/api/v1/ordenes/estadisticas/producto/prod001
curl -X GET http://localhost:4010/api/v1/ordenes/estadisticas/producto/prod005

# ========================================
# FLUJO COMPLETO DE PRUEBA
# ========================================

echo "Ejecutando flujo completo de prueba..."

# Paso 1: Crear un carrito nuevo
echo "1. Creando carrito..."
curl -X POST http://localhost:4010/api/v1/carrito/crearCarrito \
  -H "Content-Type: application/json" \
  -d '{"compradorId": "testuser", "productos": []}'

echo -e "\n"

# Paso 2: Agregar productos al carrito (asumiendo ID 6)
echo "2. Agregando productos..."
curl -X POST http://localhost:4010/api/v1/carrito/agregarProductos \
  -H "Content-Type: application/json" \
  -d '{
    "carritoId": 6,
    "productos": [
      {"productoId": "test001", "nombre": "Producto Test 1", "precio": 25.99, "cantidad": 2},
      {"productoId": "test002", "nombre": "Producto Test 2", "precio": 15.50, "cantidad": 1}
    ]
  }'

echo -e "\n"

# Paso 3: Ver el carrito actualizado
echo "3. Verificando carrito..."
curl -X GET http://localhost:4010/api/v1/carrito/obtenerCarro/6

echo -e "\n"

# Paso 4: Hacer checkout
echo "4. Procesando checkout..."
curl -X POST http://localhost:4010/api/v1/ordenes/checkout/6

echo -e "\n"

# Paso 5: Verificar estado de pago
echo "5. Verificando estado de pago..."
curl -X GET http://localhost:4010/api/v1/ordenes/estado-pago/6

echo -e "\n"

# Paso 6: Ver historial del usuario
echo "6. Verificando historial..."
curl -X GET http://localhost:4010/api/v1/ordenes/historial/user001

echo -e "\n Flujo completo ejecutado"

# ========================================
#  CONSULTAS DIRECTAS A LA BASE DE DATOS
# ========================================

# Conectar a MySQL para verificar datos
# mysql -h 127.0.0.1 -P 3307 -u root -prootpassword ps_carrito_db

# Consultas útiles:
# SELECT * FROM carrito;
# SELECT * FROM ordenes;
# SELECT comprador_id, COUNT(*) as total_carritos FROM carrito GROUP BY comprador_id;
# SELECT estado_pago, COUNT(*) as total_ordenes FROM ordenes GROUP BY estado_pago;
