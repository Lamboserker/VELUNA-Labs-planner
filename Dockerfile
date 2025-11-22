# Base-Image
FROM node:20-bookworm-slim AS base
WORKDIR /app

# === Dependencies installieren ===
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# === Build-Stage: Prisma Client + Next.js Build ===
FROM base AS builder
WORKDIR /app
ENV NODE_ENV=production

# node_modules vom deps-Stage übernehmen
COPY --from=deps /app/node_modules ./node_modules

# Projektdateien kopieren
COPY . .

# Prisma Client generieren + Next.js bauen + Dev-Dependencies entfernen
RUN npx prisma generate \
  && npm run build \
  && npm prune --omit=dev

# === Runtime-Stage ===
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# OpenSSL für Prisma + User anlegen
RUN apt-get update -y \
  && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd -r nodejs \
  && useradd -r -g nodejs nodejs

# Alles aus dem Build-Stage in /app kopieren
COPY --from=builder /app /app

# Rechte an nodejs übergeben (wichtig für Prisma Engines)
RUN chown -R nodejs:nodejs /app

# Ab hier als non-root-User laufen
USER nodejs

EXPOSE 3000

# Startkommando (Migrations werden über docker-compose ausgeführt)
CMD ["npm", "run", "start"]

