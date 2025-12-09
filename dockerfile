# --- Etapa de construcción (Build) ---
FROM node:20-alpine AS build

WORKDIR /app

# Instalamos pnpm porque tu proyecto lo usa
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .
RUN pnpm run build

# --- Etapa de ejecución (Production) ---
FROM node:20-alpine

WORKDIR /app

# Instalar dumb-init para manejar señales y crear usuario no root
RUN apk add --no-cache dumb-init && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copiamos solo lo necesario desde la etapa de build
COPY --from=build --chown=nextjs:nodejs /app/dist ./dist
COPY --from=build --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nextjs:nodejs /app/package.json ./

# Cambiar al usuario no root
USER nextjs

# Puerto interno del contenedor (El template usa variables, pero NestJS suele usar 3000 o 4010)
EXPOSE 4010

# Usar dumb-init para manejar señales correctamente
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]