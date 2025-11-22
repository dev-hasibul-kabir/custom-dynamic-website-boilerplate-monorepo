<!-- a5a3eb9e-44e7-4d83-bad0-c0a6945c6532 9b1252f2-57d7-491c-981a-fb9ec05d33a0 -->

# Fix ESLint and Prettier Configuration

## Sequential Analysis

### Current State

1. **Packages Structure:**

- `@packages/eslint-config` contains: `eslint.config.js` (base ESM), `nextjs.js`, `nestjs.js`, `node.js`, `base.js` (unused CommonJS)
- `nextjs.js` imports from `eslint.config.js` (used by Admin & Web)
- `nestjs.js` imports from `eslint.config.js` (used by API)
- `node.js` just re-exports `eslint.config.js` (used by Storage)

2. **App Dependencies:**

- `@repo/api`: Uses `nestjs.js` from packages, has `tsconfig.eslint.json` for type-aware linting
- `@repo/storage`: Uses `node.js` from packages, simple Express app
- `@repo/admin`: Uses `nextjs.js` via relative import
- `@repo/web`: Uses `nextjs.js` via package import

3. **Lint Issues Found:**

- `apps/storage/src/middlewares/auth.ts:56` - `err` caught but unused
- `apps/storage/src/utils/response.ts:12` - `ExpressError` interface defined but unused

### Sequential Execution Plan

#### Phase 1: Clean Up Packages

1. Remove `nestjs.js` from `@packages/eslint-config` (no longer needed)
2. Remove `node.js` from `@packages/eslint-config` (no longer needed)
3. Remove `base.js` from `@packages/eslint-config` (unused CommonJS file)
4. Update `package.json` `files` array to only include: `eslint.config.js`, `nextjs.js`

#### Phase 2: Create Standalone API Config (NestJS)

1. Create `apps/api/eslint.config.js` with:

- Import base config from `../../packages/eslint-config/eslint.config.js`
- Add type-aware parser options pointing to `tsconfig.eslint.json`
- Enable NestJS-specific rules (async handling, decorators)
- Keep memory leak prevention rules enabled

#### Phase 3: Create Standalone Storage Config (Express)

1. Create `apps/storage/eslint.config.js` with:

- Import base config from `../../packages/eslint-config/eslint.config.js`
- Simple config without type-aware rules (no parserOptions.project)
- Keep basic TypeScript and security rules

#### Phase 4: Update Dependencies

1. Remove `@repo/eslint-config` from `apps/api/package.json` devDependencies
2. Remove `@repo/eslint-config` from `apps/storage/package.json` devDependencies
3. Keep `@repo/eslint-config` in `apps/admin/package.json` and `apps/web/package.json`

#### Phase 5: Fix Lint Issues

1. Fix `apps/storage/src/middlewares/auth.ts:56` - prefix `err` with `_` or remove if not needed
2. Fix `apps/storage/src/utils/response.ts:12` - remove unused `ExpressError` interface

#### Phase 6: Verify Prettier

1. Confirm all `.prettierrc` files reference `@repo/prettier-config` (already correct)

#### Phase 7: Test Everything

1. Run `pnpm --filter @repo/api lint` - should pass
2. Run `pnpm --filter @repo/storage lint` - should pass with no warnings
3. Run `pnpm --filter @repo/admin lint` - should pass
4. Run `pnpm --filter @repo/web lint` - should pass
5. Test `dev`, `build`, `start` scripts in all apps

### To-dos

- [x] Remove nestjs.js and node.js from @packages/eslint-config and update package.json
- [x] Create standalone ESLint config for @repo/api with NestJS-specific rules
- [x] Create standalone ESLint config for @repo/storage with Express/Node rules
- [x] Remove @repo/eslint-config from API and Storage package.json files
- [x] Fix unused variable warnings in storage app
- [x] Test dev, build, start, lint, and format scripts in all apps
