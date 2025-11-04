//import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CarritoService } from './carrito.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CarritoItemDto,
  agregarProductosDto,
  CrearCarritoDto,
} from './dto/carrito.dto';
import { CarritoEntity } from './entities/carrito.entity';
import { log } from 'console';

@ApiTags('carrito')
@Controller('carrito')
export class CarritoController {
  constructor(private readonly carritoService: CarritoService) {}

  @Post('agregarProductos')
  @ApiOperation({ summary: 'Agregar producto al carrito' })
  @ApiResponse({
    status: 201,
    description: 'Producto agregado exitosamente',
    type: CarritoEntity,
  })
  async agregarProducto(
    @Body() agregarAlCarrito: agregarProductosDto,
  ): Promise<CarritoEntity> {
    log('Agregar al carrito DTO:', agregarAlCarrito);
    return this.carritoService.agregarProducto(agregarAlCarrito);
  }

  @Post('crearCarrito')
  @ApiOperation({ summary: 'Crear un nuevo carrito' })
  @ApiResponse({
    status: 201,
    description: 'Carrito creado exitosamente',
    type: CarritoEntity,
  })
  async crearCarrito(
    @Body() crearCarritoDto: CrearCarritoDto,
  ): Promise<CarritoEntity> {
    return this.carritoService.crearCarrito(crearCarritoDto);
  }

  @Get('obtenerCarro/:id')
  @ApiOperation({ summary: 'Obtener un carrito por ID' })
  @ApiResponse({
    status: 200,
    description: 'Carrito encontrado',
    type: CarritoItemDto,
  })
  findOne(@Param('id') id: string) {
    return this.carritoService.findOne(+id);
  }

  /*@Delete('eliminar')
  @ApiOperation({ summary: 'Eliminar un producto del carrito de un comprador' })
  @ApiResponse({
    status: 200,
    description: 'Producto eliminado exitosamente del carrito',
    type: CarritoItemDto,
  })
  async eliminarProductoDelCarrito(
    @Body() eliminarProductoDto: CarritoItemDto): Promise<CarritoItemDto> {
    return this.carritoService.eliminarProducto(eliminarProductoDto);
  }*/
}
