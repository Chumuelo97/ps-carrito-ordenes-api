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
  AgregarProductoSkuDto,
  ActualizarCantidadDto,
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

  private buildBase(): { base: string; headers: Record<string, string> } {
    const baseUrl = (
      this.configService.get<string>('INVENTORY_API_URL') || ''
    ).trim();
    if (!baseUrl) throw new Error('INVENTORY_API_URL no está definida en .env');
    const token = (
      this.configService.get<string>('INVENTORY_API_TOKEN') || ''
    ).trim();
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return { base: baseUrl.replace(/\/$/, ''), headers };
  }

  private async obtenerProductoExternoPorSku(sku: string) {
    const { base, headers } = this.buildBase();
    const path = (
      this.configService.get<string>('INVENTORY_PRODUCTS_PATH') || '/productos'
    ).trim();
    const normalizedPath = path.replace(/^\//, '');
    const endpoint = `${base}/${normalizedPath}/${encodeURIComponent(sku)}`;
    this.logger.log(`Inventario por SKU: ${endpoint}`);
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(endpoint, { headers, timeout: 8000 }),
      );
      // Respuesta típica: objeto de producto
      const p: any = Array.isArray(data) ? data[0] : data;
      if (!p) return undefined;
      return {
        id: p.id ?? p.sku,
        sku: p.sku ?? p.id,
        name: p.name ?? p.nombre ?? '',
        description: p.description ?? p.descripcion ?? '',
        price: Number(p.price ?? p.precio ?? 0),
        quantity: Number(p.quantity ?? p.stock ?? 0),
        category: p.category ?? p.categoria ?? '',
        imageUrl: p.imageUrl ?? p.imagen ?? '',
      } as ProductoDto & { sku?: string };
    } catch (error: any) {
      const status = error?.response?.status;
      const snippet = (() => {
        try {
          return JSON.stringify(error?.response?.data)?.slice(0, 200);
        } catch {
          return String(error?.response?.data)?.slice(0, 200);
        }
      })();
      this.logger.error(
        `Inventario GET por SKU falló: ${status ?? 'sin status'} - ${error?.message} - ${snippet}`,
      );
      return undefined;
    }
  }

  // 1. Actualiza la firma para aceptar parámetros (puedes usar 'any' o una interfaz)
  async obtenerProductosExternos(filtros?: {
    page?: number;
    take?: number;
    order?: string;
    term?: string;
  }): Promise<ProductoDto[]> {
    try {
      const url = this.configService.get<string>('INVENTORY_API_URL');
      if (!url) throw new Error('INVENTORY_API_URL no definida');

      // Petición GET con filtros
      const { data: respuestaApi } = await firstValueFrom(
        this.httpService.get(url, { params: filtros }),
      );

      // CORRECCIÓN 1: Acceder a .data porque la respuesta es paginada
      // Si la respuesta tiene propiedad 'data', usamos esa. Si es un array directo, lo usamos.
      const listaProductos = Array.isArray(respuestaApi)
        ? respuestaApi
        : respuestaApi.data || [];

      if (!Array.isArray(listaProductos)) {
        this.logger.warn('La API externa no devolvió un array válido.');
        return [];
      }

      // CORRECCIÓN 2: Mapeo correcto según tu Swagger (campos en español)
      return listaProductos.map((prodExterno: any) => ({
        id: prodExterno.id_producto, // Swagger: id_producto
        name: prodExterno.nombre, // Swagger: nombre
        description: prodExterno.descripcion || 'Sin descripción',
        price: Number(prodExterno.precio), // Swagger: precio
        quantity: Number(prodExterno.stock), // Swagger: stock
        category: prodExterno.categoria || 'General',
        // Swagger no menciona imagen, dejamos un placeholder o string vacío
        imageUrl: prodExterno.imagen || '',
      }));
    } catch (error) {
      this.logger.error(
        `Error al obtener productos externos: ${error.message}`,
        error.stack,
      );
      return [];
    }
  }

  /*
   * Este método se encarga de "hidratar" el carrito.
   * Combina la información de los items del carrito con los detalles completos del producto.
   */

  private async _hydrateCarrito(carrito: CarritoEntity): Promise<any> {
    if (!carrito || !Array.isArray(carrito.items)) return carrito;

    // Intento NO bloqueante: si la lista externa viene vacía, devolvemos los snapshots
    const productosExternos = await this.obtenerProductosExternos().catch(
      () => [],
    );
    // Tipar explícitamente los pares [clave, valor] para satisfacer la sobrecarga de Map
    const mapById: Map<any, any> = new Map<any, any>(
      productosExternos.map((p: any): [any, any] => [p.id, p]),
    );
    const mapBySku: Map<any, any> = new Map<any, any>(
      productosExternos.map((p: any): [any, any] => [p.sku ?? p.id, p]),
    );

    const itemsDetallados = await Promise.all(
      carrito.items.map(async (item: any) => {
        const externo = item.sku
          ? mapBySku.get(item.sku)
          : mapById.get(item.productoId);
        // Fallback: si no está en lista, intenta fetch puntual por sku
        let enriched: any = externo;
        if (!enriched && item?.sku) {
          enriched = await this.obtenerProductoExternoPorSku(item.sku);
        }
        return {
          ...item,
          name: enriched?.name ?? item?.name ?? 'Producto no disponible',
          imageUrl: enriched?.imageUrl ?? item?.imageUrl ?? '',
          category: enriched?.category ?? item?.category ?? '',
          precio: item.precio ?? enriched?.price ?? 0,
        };
      }),
    );

    return { ...carrito, items: itemsDetallados };
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
    if (!carrito) throw new NotFoundException('Carrito no encontrado.');
    return (await this._hydrateCarrito(carrito)) as CarritoDetalladoDto;
  }

  private async encontrarProductoPorSku(sku: string) {
    return this.obtenerProductoExternoPorSku(sku);
  }

  async agregarProductoPorSku(
    dto: AgregarProductoSkuDto,
  ): Promise<CarritoDetalladoDto> {
    const producto = await this.encontrarProductoPorSku(dto.sku);
    if (!producto)
      throw new NotFoundException(
        'Producto (SKU) no encontrado en inventario externo',
      );
    if (producto.quantity < dto.cantidad) {
      throw new BadRequestException(
        `Stock insuficiente. Disponible: ${producto.quantity}`,
      );
    }

    let carrito = await this.carritoRepository.findOne({
      where: { compradorId: dto.compradorId },
    });
    if (!carrito) {
      carrito = await this.carritoRepository.save(
        this.carritoRepository.create({
          compradorId: dto.compradorId,
          total: 0,
          items: [],
        }),
      );
    }
    if (!carrito.items) carrito.items = [];

    const existing = carrito.items.find((i: any) => i.sku === dto.sku);
    if (existing) {
      existing.cantidad += dto.cantidad;
      existing.precio = existing.precio ?? producto.price;
    } else {
      carrito.items.push({
        sku: dto.sku,
        productoId: producto.id, // por compatibilidad
        cantidad: dto.cantidad,
        precio: producto.price,
        name: producto.name,
        imageUrl: producto.imageUrl,
        category: producto.category,
      });
    }

    carrito.total = carrito.items.reduce(
      (sum: number, it: any) =>
        sum + Number(it.precio || 0) * Number(it.cantidad || 0),
      0,
    );

    const guardado = await this.carritoRepository.save(carrito);
    return (await this._hydrateCarrito(guardado)) as CarritoDetalladoDto;
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
    agregar: agregarProductosDto,
  ): Promise<CarritoDetalladoDto> {
    if (agregar.sku && !agregar.productoId) {
      return this.agregarProductoPorSku({
        compradorId: agregar.compradorId,
        sku: agregar.sku,
        cantidad: agregar.cantidad,
      });
    }

    const producto = await this.encontrarProductoPorId(
      Number(agregar.productoId),
    );
    if (!producto)
      throw new NotFoundException(
        'Producto no encontrado en inventario externo',
      );
    if (producto.quantity < agregar.cantidad) {
      throw new BadRequestException(
        `Stock insuficiente. Disponible: ${producto.quantity}`,
      );
    }

    let carrito = await this.carritoRepository.findOne({
      where: { compradorId: agregar.compradorId },
    });
    if (!carrito) {
      carrito = await this.carritoRepository.save(
        this.carritoRepository.create({
          compradorId: agregar.compradorId,
          total: 0,
          items: [],
        }),
      );
    }
    if (!carrito.items) carrito.items = [];

    const item = carrito.items.find((i: any) =>
      agregar.productoId
        ? i.productoId === agregar.productoId
        : i.sku === agregar.sku,
    );
    if (item) {
      item.cantidad += agregar.cantidad;
      item.precio = item.precio ?? producto.price;
      item.name = item.name ?? producto.name;
      item.imageUrl = item.imageUrl ?? producto.imageUrl;
      item.category = item.category ?? producto.category;
      item.sku = item.sku ?? (producto as any).sku;
    } else {
      carrito.items.push({
        productoId: agregar.productoId ?? producto.id,
        sku: (producto as any).sku,
        cantidad: agregar.cantidad,
        precio: producto.price,
        name: producto.name,
        imageUrl: producto.imageUrl,
        category: producto.category,
      });
    }

    carrito.total = carrito.items.reduce(
      (sum: number, it: any) =>
        sum + Number(it.precio || 0) * Number(it.cantidad || 0),
      0,
    );

    const guardado = await this.carritoRepository.save(carrito);
    return (await this._hydrateCarrito(guardado)) as CarritoDetalladoDto;
  }

  async actualizarCantidad(
    dto: ActualizarCantidadDto,
  ): Promise<CarritoDetalladoDto> {
    const { compradorId, productoId, sku, cantidad, carritoId } = dto as any;
    if (!productoId && !sku)
      throw new BadRequestException('Debe enviar productoId o sku');

    let carrito = carritoId
      ? await this.carritoRepository.findOne({ where: { id: carritoId } })
      : await this.carritoRepository.findOne({
          where: { compradorId },
          order: { id: 'DESC' },
        });

    if (!carrito) throw new NotFoundException('Carrito no encontrado.');
    if (!Array.isArray(carrito.items) || carrito.items.length === 0) {
      throw new NotFoundException('No hay productos en el carrito.');
    }

    const idx = carrito.items.findIndex((i: any) =>
      sku ? i.sku === sku : i.productoId === Number(productoId),
    );
    if (idx === -1)
      throw new NotFoundException('Producto no encontrado en el carrito.');

    if (cantidad <= 0) {
      // si envía 0, elimina
      carrito.items.splice(idx, 1);
    } else {
      (carrito.items[idx] as any).cantidad = cantidad;
    }

    carrito.total = carrito.items.reduce(
      (sum: number, it: any) =>
        sum + Number(it.precio || 0) * Number(it.cantidad || 0),
      0,
    );

    const guardado = await this.carritoRepository.save(carrito);
    return (await this._hydrateCarrito(guardado)) as CarritoDetalladoDto;
  }

  async eliminarProducto(
    eliminarProductoDto: EliminarProductoDto,
  ): Promise<CarritoDetalladoDto> {
    const { compradorId, productoId, carritoId, sku } =
      eliminarProductoDto as any;

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

    const itemIndex = carrito.items.findIndex((item: any) =>
      sku ? item.sku === sku : item.productoId === Number(productoId),
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

    carrito.total = carrito.items.reduce(
      (sum: number, it: any) =>
        sum + Number(it.precio || 0) * Number(it.cantidad || 0),
      0,
    );

    const carritoGuardado = await this.carritoRepository.save(carrito);
    return (await this._hydrateCarrito(carritoGuardado)) as CarritoDetalladoDto;
  }
}
