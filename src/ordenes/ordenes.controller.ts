import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  NotFoundException,
  InternalServerErrorException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrdenesService } from './ordenes.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('ordenes')
@Controller('ordenes')
export class OrdenesController {
  constructor(private readonly ordenesService: OrdenesService) {}

  @Post('checkout/:carritoId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Realizar checkout de un carrito y crear orden' })
  @ApiResponse({
    status: 201,
    description:
      'Orden creada exitosamente con detalle de items pagados. Carrito vaciado.',
    schema: {
      example: {
        orden: {
          id: 1,
          carritoId: 12,
          compradorId: 'user-123',
          total: 59997,
          estadoPago: 'PENDIENTE',
          fechaCreacion: '2025-12-10T12:00:00.000Z',
        },
        items: [
          {
            productoId: 101,
            cantidad: 3,
            precio: 19990,
            name: 'Collar luminiscente',
            imageUrl: 'https://...',
            category: 'accesorios',
            sku: 'SKU-001',
          },
        ],
        total: 59997,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Carrito vacío o datos inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Carrito no encontrado',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno al procesar la orden',
  })
  async checkout(@Param('carritoId') carritoId: string) {
    return this.ordenesService.crearOrden(carritoId);
  }

  @Get('estado-pago/:carritoId')
  @ApiOperation({ summary: 'Obtener estado de pago de un carrito' })
  async obtenerEstadoPago(@Param('carritoId') carritoId: string) {
    return this.ordenesService.obtenerEstadoPago(carritoId);
  }

  @Get('historial/:compradorId')
  @ApiOperation({ summary: 'Obtener historial de órdenes de un comprador' })
  @ApiResponse({
    status: 200,
    description:
      'Historial de órdenes obtenido exitosamente con detalle de items, en momento que la compra fuera exitosa.',
    schema: {
      example: [
        {
          orden: {
            id: 1,
            carritoId: 12,
            compradorId: 'user-123',
            total: 59997,
            estadoPago: 'PENDIENTE',
            fechaCreacion: '2025-12-10T12:00:00.000Z',
          },
          items: [
            {
              productoId: 101,
              cantidad: 3,
              precio: 19990,
              name: 'Collar luminiscente',
              imageUrl: 'https://...',
              category: 'accesorios',
              sku: 'SKU-001',
            },
          ],
          total: 59997,
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontraron órdenes para el comprador',
  })
  async obtenerHistorial(@Param('compradorId') compradorId: string) {
    try {
      return await this.ordenesService.obtenerHistorialComprador(compradorId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(
        `Error al obtener el historial: ${error.message}`,
      );
    }
  }

  @Get('estadisticas/producto/:productoId')
  @ApiOperation({ summary: 'Obtener estadísticas de un producto' })
  async obtenerEstadisticasProducto(@Param('productoId') productoId: string) {
    return this.ordenesService.obtenerEstadisticasProducto(productoId);
  }

  @Put('actualizarCheckout/:ordenId')
  @ApiOperation({
    summary:
      'Actualizar orden durante el checkout (agregar/modificar productos)',
  })
  @ApiResponse({
    status: 200,
    description: 'Orden actualizada exitosamente',
    schema: {
      example: {
        orden: {
          id: 1,
          carritoId: 12,
          compradorId: 'user-123',
          total: 59997,
          estadoPago: 'PENDIENTE',
          fechaCreacion: '2025-12-10T12:00:00.000Z',
          items: [
            {
              productoId: 101,
              cantidad: 3,
              precio: 19990,
              name: 'Collar luminiscente',
              imageUrl: 'https://...',
              category: 'accesorios',
              sku: 'SKU-001',
            },
          ],
        },
        items: [
          {
            productoId: 101,
            cantidad: 3,
            precio: 19990,
            name: 'Collar luminiscente',
            imageUrl: 'https://...',
            category: 'accesorios',
            sku: 'SKU-001',
          },
        ],
        total: 59997,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Orden no encontrada',
  })
  async actualizarCheckout(
    @Param('ordenId') ordenId: string,
    @Body() body: { items: any[] },
  ) {
    try {
      return await this.ordenesService.actualizarCheckout(+ordenId, body.items);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(
        `Error al actualizar la orden: ${error.message}`,
      );
    }
  }
}
