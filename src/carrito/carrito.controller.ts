//import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CarritoService } from './carrito.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  agregarProductosDto,
  CrearCarritoDto,
  EliminarCarritoDto,
  EliminarProductoDto,
} from './dto/carrito.dto';
import { CarritoEntity } from './entities/carrito.entity';
import { CarritoDetalladoDto } from './dto/carrito.dto';
import { log } from 'console';

@ApiTags('carrito')
@Controller('carrito')
export class CarritoController {
  constructor(private readonly carritoService: CarritoService) {}

  @Post('crearCarrito')
  @ApiOperation({ summary: 'Crear un nuevo carrito' })
  @ApiResponse({
    status: 201,
    description: 'Carrito creado exitosamente',
    type: CarritoDetalladoDto,
  })
  async crearCarrito(
    @Body() crearCarritoDto: CrearCarritoDto,
  ): Promise<CarritoDetalladoDto> {
    return this.carritoService.crearCarrito(crearCarritoDto);
  }

  @Delete('eliminarCarrito')
  @ApiOperation({ summary: 'Eliminar un producto del carrito de un comprador' })
  @ApiResponse({
    status: 200,
    description: 'Producto eliminado exitosamente del carrito',
    type: CarritoDetalladoDto,
  })
  async eliminarCarrito(
    @Body() eliminarcarritoDto: EliminarCarritoDto,
  ): Promise<CarritoDetalladoDto> {
    return this.carritoService.eliminarCarrito(eliminarcarritoDto);
  }

  @Get('obtenerCarro/:id')
  @ApiOperation({ summary: 'Obtener un carrito por ID' })
  @ApiResponse({
    status: 200,
    description: 'Carrito encontrado',
    type: CarritoDetalladoDto,
  })
  encontrarCarritoPorId(@Param('id') id: string) {
    return this.carritoService.encontrarCarritoPorId(+id);
  }

  @Post('agregarProductos')
  @ApiOperation({ summary: 'Agregar producto al carrito' })
  @ApiResponse({
    status: 201,
    description: 'Producto agregado exitosamente',
    type: CarritoDetalladoDto,
  })
  async agregarProducto(
    @Body() agregarAlCarrito: agregarProductosDto,
  ): Promise<CarritoDetalladoDto> {
    log('Agregar al carrito DTO:', agregarAlCarrito);
    return this.carritoService.agregarProducto(agregarAlCarrito);
  }

  @Delete('eliminarProducto')
  @ApiOperation({ summary: 'Eliminar un producto del carrito de un comprador' })
  @ApiResponse({
    status: 200,
    description:
      'Carrito eliminado exitosamente (o producto eliminado si se implementa)',
    type: CarritoDetalladoDto,
  })
  async eliminarProductoDelCarrito(
    @Body() eliminarProductoDto: EliminarProductoDto,
  ): Promise<CarritoDetalladoDto> {
    return this.carritoService.eliminarProducto(eliminarProductoDto);
  }
}
