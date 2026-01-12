# ---------- deps ----------
FROM node:20-bookworm-slim AS deps
WORKDIR /app

# Prisma necesita OpenSSL en Debian
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci


# ---------- build ----------
FROM node:20-bookworm-slim AS build
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# MUY IMPORTANTE: forzar schema correcto
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npm run build


# ---------- runner ----------
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# IMPORTANTE: copiar node_modules DESDE build (ya incluye .prisma/client bien generado)
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY prisma ./prisma
COPY package*.json ./

EXPOSE 3005
CMD ["node","dist/src/main.js"]
