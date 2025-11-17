# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages ./packages

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/api ./apps/api

# Generate Prisma client and build
WORKDIR /app/apps/api
RUN pnpm --filter @repo/api db:generate
RUN pnpm --filter @repo/api build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages ./packages

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built application
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

WORKDIR /app/apps/api

# Generate Prisma client in production
RUN pnpm --filter @repo/api db:generate

EXPOSE 5002

CMD ["pnpm", "--filter", "@repo/api", "start"]

