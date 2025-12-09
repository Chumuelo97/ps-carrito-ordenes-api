-- Script de datos de prueba para ps_carrito_db
-- Ejecutar después de que la aplicación esté funcionando

USE ps_carrito_db;

-- Limpiar datos existentes (opcional)
DELETE FROM ordenes;
DELETE FROM carrito;

-- Reiniciar auto_increment
ALTER TABLE carrito AUTO_INCREMENT = 1;
ALTER TABLE ordenes AUTO_INCREMENT = 1;

-- Insertar carritos de prueba (precios en CLP - pesos chilenos)
INSERT INTO carrito (comprador_id, total, productos, fecha_creacion, fecha_actualizacion) VALUES
(
    'user001', 
    894000, 
    '[{"productoId": "prod001", "nombre": "Laptop Gaming", "precio": 850000, "cantidad": 1}, {"productoId": "prod002", "nombre": "Mouse Inalambrico", "precio": 22000, "cantidad": 2}]', 
    '2025-12-01 10:30:00', 
    '2025-12-01 11:45:00'
),
(
    'user002', 
    78500, 
    '[{"productoId": "prod003", "nombre": "Teclado Mecanico", "precio": 65000, "cantidad": 1}, {"productoId": "prod004", "nombre": "Mousepad", "precio": 13500, "cantidad": 1}]', 
    '2025-12-02 09:15:00', 
    '2025-12-02 09:15:00'
),
(
    'user003', 
    485950, 
    '[{"productoId": "prod005", "nombre": "Monitor 24 pulgadas", "precio": 295000, "cantidad": 1}, {"productoId": "prod006", "nombre": "Webcam HD", "precio": 75000, "cantidad": 1}, {"productoId": "prod007", "nombre": "Cable HDMI", "precio": 18500, "cantidad": 1}, {"productoId": "prod008", "nombre": "Soporte Monitor", "precio": 97450, "cantidad": 1}]', 
    '2025-12-03 14:20:00', 
    '2025-12-03 16:30:00'
),
(
    'user001', 
    105500, 
    '[{"productoId": "prod009", "nombre": "Auriculares Bluetooth", "precio": 85000, "cantidad": 1}, {"productoId": "prod010", "nombre": "Cargador USB-C", "precio": 20500, "cantidad": 1}]', 
    '2025-12-04 08:45:00', 
    '2025-12-04 08:45:00'
),
(
    'user004', 
    0, 
    '[]', 
    '2025-12-05 12:00:00', 
    '2025-12-05 12:00:00'
);

-- Insertar órdenes de prueba (precios en CLP - pesos chilenos)
INSERT INTO ordenes (carrito_id, comprador_id, estado_pago, total, fecha_creacion) VALUES
(
    1, 
    'user001', 
    'PAGADO', 
    894000, 
    '2025-12-01 12:00:00'
),
(
    2, 
    'user002', 
    'PENDIENTE', 
    78500, 
    '2025-12-02 10:30:00'
),
(
    3, 
    'user003', 
    'PAGADO', 
    485950, 
    '2025-12-03 17:15:00'
);

-- Mostrar datos insertados
SELECT 'CARRITOS INSERTADOS:' as Info;
SELECT id, comprador_id, total, DATE(fecha_creacion) as fecha, CHAR_LENGTH(productos) as productos_length FROM carrito;

SELECT 'ÓRDENES INSERTADAS:' as Info;
SELECT id, carrito_id, comprador_id, estado_pago, total, DATE(fecha_creacion) as fecha FROM ordenes;

SELECT 'ESTADÍSTICAS:' as Info;
SELECT 
    COUNT(*) as total_carritos,
    COUNT(CASE WHEN productos != '[]' AND productos IS NOT NULL THEN 1 END) as carritos_con_productos,
    COUNT(CASE WHEN productos = '[]' OR productos IS NULL THEN 1 END) as carritos_vacios,
    SUM(total) as valor_total_carritos
FROM carrito;
