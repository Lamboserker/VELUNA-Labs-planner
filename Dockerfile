FROM node:20-bookworm-slim AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM base AS builder
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma client and build the Next.js app, then drop dev deps.
RUN apt-get update -y && apt-get install -y openssl
RUN npx prisma generate \
  && npm run build \
  && npm prune --omit=dev

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app

# Use a non-root user for the runtime container.
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs
USER nodejs

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "run", "start"]
