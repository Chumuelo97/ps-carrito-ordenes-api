// src/carrito/carrito.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarritoEntity } from './entities/carrito.entity';
import { ProductoDto } from './dto/producto.dto';
import {
  agregarProductosDto,
  EliminarProductoDto,
  CrearCarritoDto,
  CarritoDetalladoDto,
  EliminarCarritoDto,
} from './dto/carrito.dto';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CarritoService {
  private readonly logger = new Logger(CarritoService.name);

  constructor(
    @InjectRepository(CarritoEntity)
    private carritoRepository: Repository<CarritoEntity>,
    private readonly httpService: HttpService, // Inyección de HttpService
    private readonly configService: ConfigService, // Inyección de ConfigService
  ) {}
  async obtenerProductosExternos(): Promise<ProductoDto[]> {
    try {
      const url = this.configService.get<string>('INVENTORY_API_URL');
      if (!url) {
        throw new Error(
          'INVENTORY_API_URL no está definida en la configuración.',
        );
      }
      const { data } = await firstValueFrom(this.httpService.get(url));

      // IMPORTANTE: Mapeo de datos
      // La API externa puede tener nombres de campos distintos (ej. 'nombre' en vez de 'name').
      // Aquí transformamos la respuesta externa a tu ProductoDto interno.

      return data.map((producto: any) => ({
        id: producto.id,
        name: producto.name || producto.nombre, // Ajusta según la respuesta real de la API externa
        description: producto.description || producto.descripcion,
        price: Number(producto.price || producto.precio),
        quantity: Number(producto.stock || producto.quantity || 0), // Ojo: Inventario suele usar 'stock'
        category: producto.category || producto.categoria,
        imageUrl: producto.imageUrl || producto.imagen,
      }));
    } catch (error) {
      this.logger.error(
        'Error al conectar con el microservicio de inventario',
        error.message,
      );
      // En caso de fallo, podrías retornar un array vacío o lanzar una excepción según tu lógica de negocio
      return [];
    }
  }

  /*
   * Este método se encarga de "hidratar" el carrito.
   * Combina la información de los items del carrito con los detalles completos del producto.
   */

  private async _hydrateCarrito(carrito: CarritoEntity): Promise<any> {
    if (!carrito || !Array.isArray(carrito.items)) {
      return carrito;
    }

    // CAMBIO: Usamos la API externa en lugar del archivo
    const todosLosProductos = await this.obtenerProductosExternos();
    const productosMap = new Map(todosLosProductos.map((p) => [p.id, p]));

    const itemsDetallados = carrito.items.map((item) => {
      const detallesProducto = productosMap.get(item.productoId);
      return {
        ...item,
        carritoItemId: (item as any).carritoItemId,
        name: detallesProducto?.name || 'Producto no disponible', // Manejo de producto borrado en inventario
        imageUrl: detallesProducto?.imageUrl || '',
        category: detallesProducto?.category || '',
        ...detallesProducto,
        // Preservamos el precio del carrito si ya se agregó, o usamos el actual
        precio: item.precio || detallesProducto?.price,
      };
    });

    return {
      ...carrito,
      items: itemsDetallados,
    };
  }
  /*  * CRUD de la entidad Carrito
   * encontrarCarritoPorId
   * crearCarrito
   * eliminarCarrito
   * obtenerCarritos
   */

  //get carritos por id
  async encontrarCarritoPorId(id: number): Promise<CarritoDetalladoDto> {
    const carrito = await this.carritoRepository.findOne({ where: { id } });
    if (!carrito)
      throw new NotFoundException(`Carrito with ID ${id} not found`);
    const carritoHidratado = await this._hydrateCarrito(carrito);
    return carritoHidratado as CarritoDetalladoDto;
  }
  //get carritos
  async obtenerCarritos(): Promise<CarritoDetalladoDto[]> {
    const carritos = await this.carritoRepository.find();
    const carritosHidratados = await Promise.all(
      carritos.map((carrito) => this._hydrateCarrito(carrito)),
    );
    return carritosHidratados as CarritoDetalladoDto[];
  }
  async crearCarrito(
    crearCarritoDto: CrearCarritoDto,
  ): Promise<CarritoDetalladoDto> {
    const { compradorId } = crearCarritoDto;

    // Buscar si ya existe un carrito para el comprador
    let carrito = await this.carritoRepository.findOne({
      where: { compradorId },
    });

    if (!carrito) {
      // Si no existe, crear un nuevo carrito vacío
      carrito = this.carritoRepository.create({
        compradorId,
        total: 0,
        items: [],
      });
      carrito = await this.carritoRepository.save(carrito);
    }
    return (await this._hydrateCarrito(carrito)) as CarritoDetalladoDto;
  }

  async eliminarCarrito(
    eliminarCarritoDto: EliminarCarritoDto,
  ): Promise<CarritoDetalladoDto> {
    // ... (tu código actual)
    const { compradorId, carritoId } = eliminarCarritoDto as any;
    let carrito: CarritoEntity | null = null;
    if (carritoId) {
      carrito = await this.carritoRepository.findOne({
        where: { id: carritoId },
      });
    } else {
      carrito = await this.carritoRepository.findOne({
        where: { compradorId },
        order: { id: 'DESC' },
      });
    }
    if (!carrito) throw new NotFoundException(`Carrito no encontrado.`);
    const carritoHidratado = await this._hydrateCarrito(carrito);
    await this.carritoRepository.remove(carrito);
    return carritoHidratado as CarritoDetalladoDto;
  }

  /*  * CRUD de la entidad Producto en el carrito
   * agregarProducto
   * encontrarProductoPorId <--- ESTO LEE LOS PRODUCTOS DESDE EL ARCHIVO 'productos.txt'
   * eliminarProductoDelCarrito
   */

  private async encontrarProductoPorId(
    productId: number,
  ): Promise<ProductoDto | undefined> {
    // CAMBIO: Usamos la API externa
    const productos = await this.obtenerProductosExternos();
    return productos.find((p) => p.id === productId);
  }

  async agregarProducto(
    agregarAlCarro: agregarProductosDto,
  ): Promise<CarritoDetalladoDto> {
    const producto = await this.encontrarProductoPorId(
      agregarAlCarro.productoId,
    );

    if (!producto) {
      throw new NotFoundException(
        'Producto no encontrado en inventario externo',
      );
    }

    if (producto.quantity < agregarAlCarro.cantidad) {
      throw new BadRequestException(
        `Stock insuficiente. Disponible: ${producto.quantity}`,
      );
    }

    let carrito = await this.carritoRepository.findOne({
      where: { compradorId: agregarAlCarro.compradorId },
    });

    if (!carrito) {
      carrito = this.carritoRepository.create({
        compradorId: agregarAlCarro.compradorId,
        total: 0,
        items: [],
      });
      carrito = await this.carritoRepository.save(carrito);
    }

    // Inicializar items si es null
    if (!carrito.items) carrito.items = [];

    let item = carrito.items.find(
      (i) => i.productoId === agregarAlCarro.productoId,
    );

    if (item) {
      item.cantidad += agregarAlCarro.cantidad;
    } else {
      const nuevoItem = {
        productoId: agregarAlCarro.productoId,
        cantidad: agregarAlCarro.cantidad,
        precio: producto.price,
      };
      carrito.items.push(nuevoItem as any);
    }

    // Recalcular total
    carrito.total = carrito.items.reduce(
      (sum, currentItem) =>
        sum +
        Number((currentItem as any).precio || 0) *
          Number((currentItem as any).cantidad || 0),
      0,
    );

    const carritoGuardado = await this.carritoRepository.save(carrito);
    return (await this._hydrateCarrito(carritoGuardado)) as CarritoDetalladoDto;
  }

  async eliminarProducto(
    eliminarProductoDto: EliminarProductoDto,
  ): Promise<CarritoDetalladoDto> {
    // ... (tu código actual sin cambios, solo copiar y pegar)
    const { compradorId, productoId, carritoId } = eliminarProductoDto as any;
    let carrito: CarritoEntity | null = null;
    if (carritoId) {
      carrito = await this.carritoRepository.findOne({
        where: { id: carritoId },
      });
    } else {
      carrito = await this.carritoRepository.findOne({
        where: { compradorId },
        order: { id: 'DESC' },
      });
    }
    if (!carrito) throw new NotFoundException(`Carrito no encontrado.`);
    if (!Array.isArray(carrito.items) || carrito.items.length === 0) {
      throw new NotFoundException(`No hay productos en el carrito.`);
    }
    const itemIndex = carrito.items.findIndex(
      (item) => item.productoId === productoId,
    );
    if (itemIndex === -1)
      throw new NotFoundException(`Producto no encontrado en el carrito.`);

    const eliminarCantidad = Number((eliminarProductoDto as any).cantidad) || 0;
    if (eliminarCantidad <= 0)
      throw new BadRequestException('Cantidad a eliminar debe ser mayor a 0');

    const item = carrito.items[itemIndex] as any;
    if (eliminarCantidad >= Number(item.cantidad)) {
      carrito.items.splice(itemIndex, 1);
    } else {
      item.cantidad = Number(item.cantidad) - eliminarCantidad;
      carrito.items[itemIndex] = item;
    }
    carrito.total = carrito.items.reduce((sum, item) => {
      return (
        sum +
        (Number((item as any).precio) || 0) *
          (Number((item as any).cantidad) || 0)
      );
    }, 0);

    const carritoGuardado = await this.carritoRepository.save(carrito);
    return (await this._hydrateCarrito(carritoGuardado)) as CarritoDetalladoDto;
  }
}


