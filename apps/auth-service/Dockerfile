# Etapa de dependencias (instala OpenSSL para Prisma)
FROM node:20-bullseye-slim AS deps
WORKDIR /app
ENV NODE_ENV=development

# Instalar herramientas y librerías necesarias para Prisma en tiempo de build
RUN apt-get update \
	&& apt-get install -y --no-install-recommends build-essential python3 libssl-dev ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

RUN corepack enable
COPY package*.json ./
RUN npm ci

# Etapa de build
FROM node:20-bullseye-slim AS build
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Genera cliente Prisma (si aplica) y compila el proyecto
RUN npm run prisma:generate || true
RUN npm run build

# Etapa runtime ligera
FROM node:20-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable

# Copiar artefactos
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 3002
CMD ["node", "dist/src/main.js"]