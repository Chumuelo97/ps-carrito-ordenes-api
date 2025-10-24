import { Controller, Post, Get, Param } from '@nestjs/common';
import { OrdenesService } from './ordenes.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('ordenes')
@Controller('ordenes')
export class OrdenesController {
  constructor(private readonly ordenesService: OrdenesService) {}

  @Post('checkout/:carritoId')
  @ApiOperation({ summary: 'Realizar checkout de un carrito' })
  @ApiResponse({ status: 201, description: 'Orden creada exitosamente' })
  async checkout(@Param('carritoId') carritoId: string) {
    console.log('Checkout endpoint hit with carritoId:', carritoId);
    return this.ordenesService.crearOrden(carritoId);
  }

  @Get('estado-pago/:carritoId')
  @ApiOperation({ summary: 'Obtener estado de pago de un carrito' })
  async obtenerEstadoPago(@Param('carritoId') carritoId: string) {
    return this.ordenesService.obtenerEstadoPago(carritoId);
  }

  @Get('historial/:compradorId')
  @ApiOperation({ summary: 'Obtener historial de órdenes de un comprador' })
  async obtenerHistorial(@Param('compradorId') compradorId: string) {
    return this.ordenesService.obtenerHistorialComprador(compradorId);
  }

  @Get('estadisticas/producto/:productoId')
  @ApiOperation({ summary: 'Obtener estadísticas de un producto' })
  async obtenerEstadisticasProducto(@Param('productoId') productoId: string) {
    return this.ordenesService.obtenerEstadisticasProducto(productoId);
  }
}
