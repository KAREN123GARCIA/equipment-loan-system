# Dockerfile para loan-service (Debian-slim, con OpenSSL para Prisma)
FROM node:20-bullseye-slim AS deps
WORKDIR /app
ENV NODE_ENV=development

# Instalar herramientas necesarias para Prisma/OpenSSL
RUN apt-get update \
  && apt-get install -y --no-install-recommends build-essential python3 libssl-dev ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable
COPY package*.json ./
RUN npm ci

FROM node:20-bullseye-slim AS build
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar cliente Prisma y compilar
RUN npm run prisma:generate || true
RUN npm run build

FROM node:20-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable

# Copiar artefactos
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 3004
CMD ["node", "dist/src/main.js"]
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run prisma:generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
EXPOSE 3004
CMD ["node", "dist/main.js"]
