# Custom Boilerplate - Turborepo Monorepo

A production-ready monorepo boilerplate for dynamic website development with essential functionalities like user management, file storage, backend API, admin panel, and public website.

## Structure

```
custom-boilerplate/
├── apps/
│   ├── storage/       # Express File Storage Service (Port 5001) - Runs First
│   ├── api/           # NestJS Backend API (Port 5002)
│   ├── admin/         # Next.js Admin/Back Office (Port 5003)
│   └── web/           # Next.js Public Website (Port 5004)
├── packages/
│   ├── eslint-config/      # Shared ESLint configuration
│   ├── typescript-config/  # Shared TypeScript configurations
│   └── prettier-config/    # Shared Prettier configuration
├── docker-compose.yml
├── turbo.json
└── package.json
```

## Applications

### 1. Storage (`apps/storage`) - Runs First

- **Framework**: Express.js
- **Port**: 5001
- **Features**: File upload, storage, WebP conversion, JWT authentication

### 2. API (`apps/api`)

- **Framework**: NestJS
- **Database**: PostgreSQL (Prisma ORM)
- **Port**: 5002
- **Features**: User management, authentication, authorization, role-based access control
- **Swagger**: Available at `http://localhost:5002/api/docs`
- **Health Check**: Available at `http://localhost:5002/health`

### 3. Admin (`apps/admin`)

- **Framework**: Next.js 15
- **Port**: 5003
- **Features**: Back office/admin panel for managing users, roles, permissions

### 4. Web (`apps/web`)

- **Framework**: Next.js 15
- **Port**: 5004
- **Features**: Public website starter - can be used for landing pages, e-commerce, etc.

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 8.0.0
- PostgreSQL (for API)
- Docker & Docker Compose (optional, for containerized deployment)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd custom-boilerplate
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables for each app:

#### API (`apps/api/.env`)

```env
NODE_ENV=development
HOST=0.0.0.0
PORT=5002
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
REDIS_HOST=localhost
REDIS_PORT=6379
MONGO_DATABASE_URL=mongodb://localhost:27017/dbname
MONGO_DB_USERNAME=
MONGO_DB_PASSWORD=
MONGO_DB_AUTHSOURCE=admin
CORS_ORIGINS=http://localhost:5004,http://localhost:5003
```

#### Admin (`apps/admin/.env`)

```env
NODE_ENV=development
PORT=5003
HOST=0.0.0.0
NEXT_PUBLIC_API_BASE_URL=http://localhost:5002
```

#### Web (`apps/web/.env`)

```env
NODE_ENV=development
PORT=5004
NEXT_PUBLIC_API_BASE_URL=http://localhost:5002
```

#### Storage (`apps/storage/.env`)

```env
NODE_ENV=development
HOST=0.0.0.0
PORT=5001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ATTACHMENT_FOLDER_PATH=./external/uploads
LOG_DIR_PATH=./external/logs
PUBLIC_URL=http://localhost:5001
LOCAL_URL=http://localhost:5001
```

4. Set up the database (for API):

```bash
pnpm db:migrate:dev
pnpm db:seed
```

## Development

### Run all apps in development mode (storage runs first, then api, then admin/web):

```bash
pnpm dev
```

### Run specific app individually (recommended for cleaner logs):

```bash
pnpm dev:storage    # Run Storage only (Port 5001) - Runs first
pnpm dev:api        # Run API only (Port 5002)
pnpm dev:admin      # Run Admin only (Port 5003)
pnpm dev:web        # Run Web only (Port 5004)
```

### Alternative: Run specific app using filter:

```bash
pnpm --filter @repo/api dev
pnpm --filter @repo/admin dev
pnpm --filter @repo/web dev
pnpm --filter @repo/storage dev
```

### Build all apps:

```bash
pnpm build
```

### Lint all apps:

```bash
pnpm lint
```

### Type check all apps:

```bash
pnpm type-check
```

## Database Management (API)

### Development migrations:

```bash
pnpm db:migrate:dev
```

### Production migrations:

```bash
pnpm db:migrate:prod
```

### Seed database:

```bash
pnpm db:seed
```

### Open Prisma Studio:

```bash
pnpm db:studio
```

## API Documentation

### Swagger UI

Once the API is running, access the Swagger documentation at:

```
http://localhost:5002/api/docs
```

The Swagger UI provides:

- Interactive API documentation
- Try-it-out functionality for all endpoints
- JWT authentication support
- Request/response schemas

### Health Check Endpoints

#### Full Health Check

```bash
GET /health
```

Returns comprehensive health status including:

- Database connectivity
- Memory usage (heap and RSS)
- Disk storage

#### Simple Ping

```bash
GET /health/ping
```

Returns a simple pong response to verify the API is running.

## Docker Deployment

### Build and run with Docker Compose:

```bash
docker-compose up --build
```

### Run in background:

```bash
docker-compose up -d
```

### Stop services:

```bash
docker-compose down
```

### Build individual services:

```bash
docker build -f apps/api/Dockerfile -t custom-boilerplate-api .
docker build -f apps/admin/Dockerfile -t custom-boilerplate-admin .
docker build -f apps/web/Dockerfile -t custom-boilerplate-web .
docker build -f apps/storage/Dockerfile -t custom-boilerplate-storage .
```

## Environment Validation

All apps have environment variable validation that will:

- **Fail fast** if required environment variables are missing
- **Prevent deployment/startup** if validation fails
- **Provide clear error messages** about what's missing

Validation is implemented using:

- **NestJS API**: `class-validator` with `@nestjs/config`
- **Next.js Apps**: `zod` schema validation
- **Express Storage**: `zod` schema validation

## Scripts

### Root Level Scripts

- `pnpm dev` - Run all apps in development mode (storage runs first)
- `pnpm dev:storage` - Run Storage only (Port 5001)
- `pnpm dev:api` - Run API only (Port 5002)
- `pnpm dev:admin` - Run Admin only (Port 5003)
- `pnpm dev:web` - Run Web only (Port 5004)
- `pnpm build` - Build all apps
- `pnpm build:storage` - Build Storage only
- `pnpm build:api` - Build API only
- `pnpm build:admin` - Build Admin only
- `pnpm build:web` - Build Web only
- `pnpm lint` - Lint all apps
- `pnpm lint:fix` - Fix linting issues
- `pnpm type-check` - Type check all apps
- `pnpm format` - Format all code
- `pnpm clean` - Clean all build artifacts
- `pnpm db:migrate:dev` - Run development migrations
- `pnpm db:migrate:prod` - Run production migrations
- `pnpm db:seed` - Seed database
- `pnpm db:studio` - Open Prisma Studio

## Shared Packages

### ESLint Config (`@repo/eslint-config`)

Shared ESLint configurations for:

- Base configuration
- Next.js apps
- NestJS apps
- Node/Express apps

### TypeScript Config (`@repo/typescript-config`)

Shared TypeScript configurations:

- `base.json` - Base configuration
- `nextjs.json` - Next.js configuration
- `nestjs.json` - NestJS configuration
- `node.json` - Node/Express configuration

### Prettier Config (`@repo/prettier-config`)

Shared Prettier configuration for consistent code formatting.

## Best Practices

1. **Environment Variables**: Always use `.env.example` files as templates. Never commit `.env` files.
2. **Database Migrations**: Use `db:migrate:dev` for development and `db:migrate:prod` for production.
3. **Code Quality**: Run `pnpm lint` and `pnpm type-check` before committing.
4. **Shared Configs**: Use shared packages for consistent tooling across apps.

## License

ISC
