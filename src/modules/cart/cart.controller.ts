import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Controller('carrito') // Ruta base: /api/v1/carrito
export class CartController {
  private readonly logger = new Logger(CartController.name);

  constructor(private readonly cartService: CartService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async addItemToCart(@Body() addToCartDto: AddToCartDto) {
    this.logger.log(
      `Recibida petición para agregar ítem: ${JSON.stringify(addToCartDto)}`,
    );

    // El DTO ya ha sido validado automáticamente por el ValidationPipe
    const updatedCart = await this.cartService.addItemToCart(addToCartDto);

    return {
      message: 'Ítem agregado al carrito exitosamente.',
      data: updatedCart,
    };
  }

  @Get(':userId')
  @HttpCode(HttpStatus.OK)
  async getCart(@Param('userId') userId: string) {
    const cart = await this.cartService.getCartByUserId(userId);
    return { message: 'Carrito obtenido exitosamente.', data: cart };
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.OK)
  async clearCart(@Param('userId') userId: string) {
    await this.cartService.clearCart(userId);
    return { message: `Carrito de usuario ${userId} vaciado.` };
  }
  /*@Get()
  @HttpCode(HttpStatus.OK)
  async getCart(@Body('userId') userId: string) {
    this.logger.log(`Recibida petición para obtener carrito del usuario: ${userId}`);

    const cart = await this.cartService.

    if (!cart) {
      throw new NotFoundException(`Carrito no encontrado para el usuario ${userId}`);
    }

    return {
      message: 'Carrito obtenido exitosamente.',
      data: cart,
    };
  }*/
}
