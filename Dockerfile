
# 1. Base image
FROM node:20-slim AS base

# Install build dependencies for native modules and basic utils
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# 2. Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 3. Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Build Worker
# Compile only, do not run
RUN npx tsc -p tsconfig.worker.json

# 4. Production Image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# In Debian, addgroup/adduser syntax is different or we can just use defaults
# But for security we keep the non-root user
RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 nextjs -g nodejs

# Copy Next.js public & static files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Compiled Worker
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist

# Copy Script Configs
COPY --from=builder /app/package.json ./package.json

# Copy dependencies (Required for worker)
COPY --from=deps /app/node_modules ./node_modules

# Create logs directory
RUN mkdir -p logs && chown nextjs:nodejs logs

USER nextjs

EXPOSE 3000
ENV PORT 3000

# Default command (can be overridden in docker-compose)
CMD ["node", "server.js"]
