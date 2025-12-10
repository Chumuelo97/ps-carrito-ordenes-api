//import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
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

  @Get('productos')
  @ApiOperation({ summary: 'Listar productos desde inventario externo' })
  async productosExternos(
    @Query('page') page?: string,
    @Query('take') take?: string,
    @Query('order') order?: string,
  ) {
    const pageNum =
      page && !Number.isNaN(Number(page)) ? parseInt(page, 10) : 1;
    const takeNum =
      take && !Number.isNaN(Number(take)) ? parseInt(take, 10) : 10;
    const orderStr = order && order.toLowerCase() === 'desc' ? 'desc' : 'asc';
    return this.carritoService.obtenerProductosExternos({
      page: pageNum,
      take: takeNum,
      order: orderStr,
    });
  }

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

  @Delete('eliminarCarrito/:id')
  @ApiOperation({ summary: 'Eliminar un carrito por ID' })
  @ApiResponse({
    status: 200,
    description: 'Carrito eliminado exitosamente por ID',
    type: CarritoDetalladoDto,
  })
  async eliminarCarritoPorId(
    @Param('id') id: string,
  ): Promise<CarritoDetalladoDto> {
    return this.carritoService.eliminarCarrito({
      carritoId: +id,
    } as EliminarCarritoDto);
  }

  @Get('obtenerCarritos')
  @ApiOperation({ summary: 'Obtener todos los carritos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de carritos',
    type: [CarritoDetalladoDto],
  })
  async obtenerCarritos(): Promise<CarritoDetalladoDto[]> {
    return this.carritoService.obtenerCarritos();
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
