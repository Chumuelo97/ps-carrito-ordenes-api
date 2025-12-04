import {
  Controller,
  Post,
  Param,
  Body,
  HttpCode,
  HttpException,
  Get,
  ParseIntPipe,
} from '@nestjs/common';
import { OrdenesService } from './ordenes.service';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { CreateOrdenResponseDto } from './dto/create-orden-response.dto';

@Controller('ordenes')
export class OrdenesController {
  constructor(private readonly ordenesService: OrdenesService) {}

  // Mantener la ruta tal como la tienes: POST /ordenes/:compradorId
  // El body (CreateOrdenDto) es opcional; se acepta si quieres pasar direccion/nombre/total.
  @Post(':compradorId')
  @HttpCode(201)
  async crear(
    @Param('compradorId') compradorId: string,
    @Body() createOrdenDto?: CreateOrdenDto,
  ): Promise<CreateOrdenResponseDto> {
    try {
      return await this.ordenesService.crearOrdenDesdeCarrito(
        compradorId,
        createOrdenDto,
      );
    } catch (err: any) {
      // err.status puede venir de excepciones de Nest; si no, 500
      throw new HttpException(err.message || 'Error interno', err.status || 500);
    }
  }

  // Endpoints auxiliares ya existentes: GET orden por id y por comprador
  @Get(':ordenId')
  async obtener(@Param('ordenId', ParseIntPipe) ordenId: number) {
    return this.ordenesService.obtenerOrden(ordenId);
  }

  @Get('comprador/:compradorId')
  async obtenerPorComprador(@Param('compradorId') compradorId: string) {
    return this.ordenesService.obtenerOrdenesPorComprador(compradorId);
  }
}
