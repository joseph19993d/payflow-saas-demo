# ==========================================
# Dependencies
# ==========================================
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci


# ==========================================
# Build
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build


# ==========================================
# Production
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# Usuario no-root
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Dependencias instaladas
COPY --from=deps /app/node_modules ./node_modules

# package.json y lock
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# Next.js
COPY --from=builder /app/.next ./.next

# Archivos públicos
COPY --from=builder /app/public ./public

# Código fuente
COPY --from=builder /app/src ./src

# Prisma completo
COPY --from=builder /app/prisma ./prisma

# Configuración de Prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Configuración de Next
COPY --from=builder /app/next.config.ts ./next.config.ts

# TypeScript
COPY --from=builder /app/tsconfig.json ./tsconfig.json

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]