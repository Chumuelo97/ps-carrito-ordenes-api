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

  // POST /ordenes/:compradorId
  @Post(':compradorId')
  @HttpCode(201)
  async crear(
    @Param('compradorId') compradorId: string,
    @Body() createOrdenDto?: CreateOrdenDto,
  ): Promise<CreateOrdenResponseDto> {
    try {
      // Llamar al método correcto del servicio
      return await this.ordenesService.crearOrdenDesdeCarrito(
        compradorId,
        createOrdenDto,
      );
    } catch (err: any) {
      throw new HttpException(err.message || 'Error interno', err.status || 500);
    }
  }

  // GET orden por id
  @Get(':ordenId')
  async obtener(@Param('ordenId', ParseIntPipe) ordenId: number) {
    return this.ordenesService.obtenerOrden(ordenId);
  }

  // GET ordenes por comprador
  @Get('comprador/:compradorId')
  async obtenerPorComprador(@Param('compradorId') compradorId: string) {
    return this.ordenesService.obtenerOrdenesPorComprador(compradorId);
  }
}
