# 📦 Documentación de la Base de Datos

**📖 Diccionario de Datos**

### Tabla: `orders`  
| Campo         | Tipo          | Restricciones                          | Descripción                                                 |
| ------------- | ------------- | -------------------------------------- | ----------------------------------------------------------- |
| `id`          | INT           | PRIMARY KEY, NOT NULL, AUTO_INCREMENT  | ID único de la orden                                        |
| `id_usuario`  | INT           | NOT NULL                               | ID del usuario que creó la orden                            |
| `estado`      | VARCHAR(50)   | NOT NULL                               | Estado de la orden (`pendiente`, `completada`, `cancelada`) |
| `monto_final` | DECIMAL(10,2) | NOT NULL                               | Monto total de la orden                                     |
| `fecha`       | DATETIME      | NOT NULL                               | Fecha y hora de creación de la orden                        |

### Tabla: `order_items`  
| Campo         | Tipo          | Restricciones                          | Descripción                                   |
| ------------- | ------------- | -------------------------------------- | --------------------------------------------- |
| `id`          | INT           | PRIMARY KEY, NOT NULL, AUTO_INCREMENT  | ID único del ítem                             |
| `id_order`    | INT           | NOT NULL                               | ID de la orden relacionada                    |
| `id_producto` | INT           | NOT NULL                               | ID del producto incluido en la orden          |
| `precio`      | DECIMAL(10,2) | NOT NULL                               | Precio del producto en el momento de la orden |

---

**🔗 Relaciones entre Tablas**  

- **Relación:** `order_items` → `orders`  
- **Campo FK:** `order_items.id_order`  
- **Campo Referenciado:** `orders.id`  
- **Tipo de Relación:** Uno a Muchos  
- **Descripción:** Una orden puede contener múltiples ítems, pero cada ítem pertenece a una sola orden.  

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
