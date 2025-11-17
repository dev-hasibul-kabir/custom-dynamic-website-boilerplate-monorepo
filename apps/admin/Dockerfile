# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/admin/package.json ./apps/admin/
COPY packages ./packages

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/admin ./apps/admin

# Build Next.js app
WORKDIR /app/apps/admin
RUN pnpm --filter @repo/admin build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/admin/package.json ./apps/admin/
COPY packages ./packages

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built application
COPY --from=builder /app/apps/admin/.next ./apps/admin/.next
COPY --from=builder /app/apps/admin/public ./apps/admin/public
COPY --from=builder /app/apps/admin/server.js ./apps/admin/
COPY --from=builder /app/apps/admin/next.config.js ./apps/admin/
COPY --from=builder /app/apps/admin/src ./apps/admin/src

WORKDIR /app/apps/admin

EXPOSE 5003

CMD ["node", "server.js"]

