# ---- Build Stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first (better cache)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY tsconfig.json ./
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS production
LABEL maintainer="devops@company.com"
LABEL version="1.0.0"

# Security: non-root user
RUN addgroup -g 1001 appgroup && \
    adduser -u 1001 -G appgroup -D appuser

WORKDIR /app
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist/
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules/
COPY --from=builder --chown=appuser:appgroup /app/package.json ./

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

USER appuser

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]

