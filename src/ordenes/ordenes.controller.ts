import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrdenesService } from './ordenes.service';
import { CheckoutDto } from './dto/checkout.dto';
import { FiltersOrdenDto } from './dto/filters-orden.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ordenes')
export class OrdenesController {
  constructor(private readonly ordenesService: OrdenesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  checkout(@Req() req, @Body() dto: CheckoutDto) {
    return this.ordenesService.checkout(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mis-ordenes')
  misOrdenes(@Query() filtros: FiltersOrdenDto, @Req() req) {
    return this.ordenesService.misOrdenes(req.user.id, filtros);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  obtenerPorId(@Param('id') id: number, @Req() req) {
    return this.ordenesService.obtenerOrdenPorId(id, req.user.id);
  }
}
