# 📦 Diagrama de secuencias

<img width="1739" height="1791" alt="diagrama de secuencia ordenes y carrito" src="https://github.com/user-attachments/assets/a462deed-7ecf-49c2-85e3-c8c348439d3b" />

# 📦 Documentación de la Base de Datos


**📖 Diccionario de Datos**
![bd png](https://github.com/user-attachments/assets/3e4dc674-d036-4f8d-ad63-e3117a8cb4d3)


### Tabla: `orders`  
| Campo         | Tipo          | Restricciones                          | Descripción                                                 |
| ------------- | ------------- | -------------------------------------- | ----------------------------------------------------------- |
| `id`          | INT           | PRIMARY KEY, NOT NULL, AUTO_INCREMENT  | ID único de la orden                                        |
| `id_usuario`  | INT           | NOT NULL                               | ID del usuario que creó la orden                            |
| `estado`      | VARCHAR(50)   | NOT NULL                               | Estado de la orden (`pendiente`, `completada`, `cancelada`) |
| `monto_final` | DECIMAL(10,2) | NOT NULL                               | Monto total de la orden                                     |
| `fecha`       | DATETIME      | NOT NULL                               | Fecha y hora de creación de la orden                        |

### Tabla: `order_items`  
| Campo         | Tipo          | Restricciones                          | Descripción                                   |
| ------------- | ------------- | -------------------------------------- | --------------------------------------------- |
| `id`          | INT           | PRIMARY KEY, NOT NULL, AUTO_INCREMENT  | ID único del ítem                             |
| `id_order`    | INT           | NOT NULL                               | ID de la orden relacionada                    |
| `id_producto` | INT           | NOT NULL                               | ID del producto incluido en la orden          |
| `precio`      | DECIMAL(10,2) | NOT NULL                               | Precio del producto en el momento de la orden |

---

**🔗 Relaciones entre Tablas**  

- **Relación:** `order_items` → `orders`  
- **Campo FK:** `order_items.id_order`  
- **Campo Referenciado:** `orders.id`  
- **Tipo de Relación:** Uno a Muchos  
- **Descripción:** Una orden puede contener múltiples ítems, pero cada ítem pertenece a una sola orden.  

---

**📏 Restricciones de Integridad**  

1. ✅ Todas las órdenes deben tener un usuario asociado.  
2. ✅ Todas las órdenes deben tener un estado definido.  
3. ✅ Todas las órdenes deben tener un monto final calculado.  
4. ✅ Todos los ítems deben pertenecer a una orden existente.  
5. ✅ Todos los ítems deben tener un producto asociado.  
6. ✅ Todos los ítems deben registrar el precio de compra.  
7. ✅ No se permiten valores nulos en campos esenciales.  

---

**🔢 Tipos de Datos**  

- **INT**: Identificadores numéricos.  
- **VARCHAR(50)**: Texto de longitud variable (para estados).  
- **DECIMAL(10,2)**: Valores monetarios (10 dígitos totales, 2 decimales).  
- **DATETIME**: Fechas con hora.  




<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
