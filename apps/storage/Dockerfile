# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/storage/package.json ./apps/storage/
COPY packages ./packages

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/storage ./apps/storage

# Build application
WORKDIR /app/apps/storage
RUN pnpm --filter @repo/storage build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/storage/package.json ./apps/storage/
COPY packages ./packages

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built application
COPY --from=builder /app/apps/storage/dist ./apps/storage/dist

WORKDIR /app/apps/storage

EXPOSE 5001

CMD ["pnpm", "--filter", "@repo/storage", "start"]

