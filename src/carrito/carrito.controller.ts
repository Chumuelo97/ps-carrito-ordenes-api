import { Controller, Get, Post, Delete, Param } from '@nestjs/common';
import { CarritoService } from './carrito.service';

@Controller('carrito')
export class CarritoController {
  constructor(private readonly carritoService: CarritoService) {}

  @Get(':compradorId')
  obtener(@Param('compradorId') compradorId: string) {
    return this.carritoService.obtenerCarrito(compradorId);
  }

  @Post(':compradorId')
  crear(@Param('compradorId') compradorId: string) {
    return this.carritoService.crearCarrito(compradorId);
  }

  @Delete(':compradorId')
  async vaciar(@Param('compradorId') compradorId: string) {
    await this.carritoService.vaciarCarrito(compradorId);
    return { message: 'Carrito vaciado' };
  }
}
