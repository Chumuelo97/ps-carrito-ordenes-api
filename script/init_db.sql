-- Inicialización de la base de datos (nombres en español)
-- Base de datos: ps_carrito_db (usa DB_DATABASE=ps_carrito_db en .env)

CREATE DATABASE IF NOT EXISTS `ps_carrito_db`
  DEFAULT CHARACTER SET = utf8mb4
  DEFAULT COLLATE = utf8mb4_unicode_ci;

USE `ps_carrito_db`;

-- Tabla: carrito
CREATE TABLE IF NOT EXISTS `carrito` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `comprador_id` VARCHAR(255) NOT NULL,
  `total` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `productos` TEXT NULL,
  `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_carrito_comprador` (`comprador_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: ordenes
CREATE TABLE IF NOT EXISTS `ordenes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `carrito_id` INT NOT NULL,
  `comprador_id` VARCHAR(255) NOT NULL,
  `estado_pago` ENUM('PENDIENTE','PAGADO','CANCELADO') NOT NULL DEFAULT 'PENDIENTE',
  `total` DECIMAL(10,2) NOT NULL,
  `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_ordenes_comprador` (`comprador_id`),
  CONSTRAINT `fk_ordenes_carrito` FOREIGN KEY (`carrito_id`) REFERENCES `carrito`(`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Nota: `productos` está como TEXT serializado (compatible con MySQL antiguo).
-- Si prefieres JSON nativo cambia la columna a `productos JSON NULL`.
