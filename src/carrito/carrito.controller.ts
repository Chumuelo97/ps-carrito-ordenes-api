//import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CarritoService } from './carrito.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateCarritoDto,
  agregarProductosAlCarritoDto,
  EliminarProductoDto,
} from './dto/carrito.dto';
import { CarritoEntity } from './entities/carrito.entity';

@ApiTags('carrito')
@Controller('carrito')
export class CarritoController {
  constructor(private readonly carritoService: CarritoService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo carrito' })
  @ApiResponse({
    status: 201,
    description: 'Carrito creado exitosamente',
    type: CarritoEntity,
  })
  async crearCarrito(
    @Body() createCarritoDto: CreateCarritoDto,
  ): Promise<CarritoEntity> {
    return this.carritoService.crearCarrito(createCarritoDto);
  }

  @Post('agregar')
  @ApiOperation({ summary: 'Agregar producto al carrito' })
  @ApiResponse({
    status: 201,
    description: 'Producto agregado exitosamente',
    type: CarritoEntity,
  })
  async agregarProducto(
    @Body() addToCartDto: agregarProductosAlCarritoDto,
  ): Promise<CarritoEntity> {
    return this.carritoService.agregarProducto(addToCartDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un carrito por ID' })
  @ApiResponse({
    status: 200,
    description: 'Carrito encontrado',
    type: CarritoEntity,
  })
  findOne(@Param('id') id: string) {
    return this.carritoService.findOne(+id);
  }

  @Delete('eliminar')
  @ApiOperation({ summary: 'Eliminar un producto del carrito de un comprador' })
  @ApiResponse({
    status: 200,
    description: 'Producto eliminado exitosamente del carrito',
    type: CarritoEntity,
  })
  async eliminarProductoDelCarrito(
    @Body() eliminarProductoDto: EliminarProductoDto,
  ): Promise<CarritoEntity> {
    return this.carritoService.eliminarProducto(eliminarProductoDto);
  }
}
