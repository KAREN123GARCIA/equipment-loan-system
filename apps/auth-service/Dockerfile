FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable

# Copiamos solo lo necesario del servicio
COPY package.json package-lock.json ./

# Instalamos dependencias necesarias para build
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app /app
COPY . .

# Generar prisma (si aplica) y compilar
RUN npm run prisma:generate || true
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copiamos artefactos y deps de producción
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

EXPOSE 3002
CMD ["node", "dist/main.js"]
