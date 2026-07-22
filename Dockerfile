# ---------------------------------------------------------------------------
# Etapa 1: instalacion de dependencias de produccion
# ---------------------------------------------------------------------------
FROM node:20-alpine AS deps

WORKDIR /app

# Se copian solo los manifiestos para aprovechar la cache de capas de Docker:
# si el codigo cambia pero package.json no, esta capa no se reconstruye.
COPY package.json package-lock.json ./

# npm ci instala exactamente lo que dice el lockfile (build reproducible)
# y --omit=dev deja fuera las dependencias de testing.
RUN npm ci --omit=dev && npm cache clean --force

# ---------------------------------------------------------------------------
# Etapa 2: imagen final de ejecucion
# ---------------------------------------------------------------------------
FROM node:20-alpine AS runner

ENV NODE_ENV=production
ENV PORT=8080

WORKDIR /app

# Usuario sin privilegios: si alguien vulnera la app, no es root dentro del contenedor.
RUN addgroup -S nodejs && adduser -S appuser -G nodejs

# Se traen solo los node_modules ya resueltos y el codigo fuente necesario.
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src

RUN chown -R appuser:nodejs /app
USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

CMD ["node", "src/server.js"]
