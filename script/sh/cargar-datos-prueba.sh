#!/bin/bash
# Script para cargar datos de prueba en la base de datos
# Ejecutar después de que los contenedores estén funcionando

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración de la base de datos
DB_HOST="127.0.0.1"
DB_PORT="3307"
DB_USER="root"
DB_PASSWORD="rootpassword"
DB_NAME="ps_carrito_db"

echo -e "${BLUE}🗄️  Cargando datos de prueba en la base de datos...${NC}"
echo -e "${YELLOW}Host: ${DB_HOST}:${DB_PORT}${NC}"
echo -e "${YELLOW}Base de datos: ${DB_NAME}${NC}"
echo ""

# Verificar si MySQL está disponible
echo -e "${BLUE}🔍 Verificando conexión a MySQL...${NC}"
if ! mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASSWORD} -e "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${RED}Error: No se puede conectar a MySQL${NC}"
    echo -e "${YELLOW}Asegúrate de que Docker Compose esté ejecutándose:${NC}"
    echo "   docker-compose up -d"
    exit 1
fi
echo -e "${GREEN}Conexión exitosa${NC}"

# Verificar si la base de datos existe
echo -e "${BLUE}Verificando base de datos ${DB_NAME}...${NC}"
if ! mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASSWORD} -e "USE ${DB_NAME};" > /dev/null 2>&1; then
    echo -e "${RED} Error: Base de datos ${DB_NAME} no existe${NC}"
    echo -e "${YELLOW}Asegúrate de que la aplicación se haya inicializado correctamente${NC}"
    exit 1
fi
echo -e "${GREEN} Base de datos encontrada${NC}"

# Ejecutar el script de datos de prueba
echo -e "${BLUE}Insertando datos de prueba...${NC}"
if mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} < ./script/datos-prueba.sql; then
    echo -e "${GREEN} Datos de prueba insertados exitosamente${NC}"
else
    echo -e "${RED} Error al insertar datos de prueba${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN} ¡Datos de prueba cargados exitosamente!${NC}"
echo ""
echo -e "${BLUE}Puedes probar la API con estos endpoints:${NC}"
echo -e "${YELLOW}# Obtener todos los carritos${NC}"
echo "curl http://localhost:4010/api/v1/carrito/obtenerCarritos"
echo ""
echo -e "${YELLOW}# Obtener carrito específico${NC}"
echo "curl http://localhost:4010/api/v1/carrito/obtenerCarro/1"
echo ""
echo -e "${YELLOW}# Obtener historial de órdenes del usuario001${NC}"
echo "curl http://localhost:4010/api/v1/ordenes/historial/user001"
echo ""
echo -e "${BLUE}🔗 También puedes conectarte directamente a MySQL:${NC}"
echo "mysql -h 127.0.0.1 -P 3307 -u root -prootpassword ps_carrito_db"
