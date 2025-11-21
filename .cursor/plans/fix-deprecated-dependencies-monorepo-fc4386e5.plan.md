<!-- fc4386e5-1015-4f6f-aa72-7158aeee31e0 a58cc559-3236-490b-936c-170d5e59d403 -->

# Fix Deprecated Dependencies, Security Vulnerabilities, and Update Node.js Version

## Issues Identified

### Deprecated Packages

1. **ESLint 8.57.x is deprecated** - Currently installed in:

- `packages/eslint-config/package.json` (v8.57.0) as dependency
- `apps/api/package.json` (v8.57.1) as devDependency
- `apps/storage/package.json` (v8.56.0) as devDependency
- `apps/admin/package.json` (v8.57.0) as devDependency
- `apps/web/package.json` (v8.57.0) as devDependency

2. **@types/bull is deprecated** - `apps/api/package.json` has `@types/bull@4.10.4`, but `bull@4.16.5` provides its own types

3. **multer is deprecated** - `apps/storage/package.json` uses `multer@1.4.5-lts.1`

### Security Vulnerabilities (from pnpm audit)

1. **Hono vulnerabilities (HIGH/MODERATE)** - `hono@4.7.10` vulnerable, needs `>=4.10.2`

- Transitive dependency via `@prisma/dev@0.13.0 > @hono/node-server@1.14.2`
- Multiple vulnerabilities: Improper Authorization, Body Limit Bypass, Vary Header Injection

2. **glob vulnerability (HIGH)** - `glob@10.4.5` vulnerable, needs `>=10.5.0`

- Transitive dependency via `tailwindcss > sucrase`

3. **js-yaml vulnerability (MODERATE)** - `js-yaml@4.1.0` vulnerable, needs `>=4.1.1`

- Transitive dependency via ESLint 8 dependencies (will be fixed with ESLint 9 upgrade)

4. **cookie vulnerability (LOW)** - `cookie@0.6.0` vulnerable, needs `>=0.7.0`

- Transitive dependency via `universal-cookie@6.1.3`

### Node.js Version Update

- Current: `>=20.0.0` (inconsistent across packages: some have `>=18.0.0`, `>=18.16.0`)
- Target: `>=24.11.1` (update all package.json files)

## Solution

### 1. Update Node.js version to v24.11.1

- Update `package.json` (root) engines.node to `>=24.11.1`
- Update all app package.json files (`apps/api`, `apps/storage`, `apps/admin`, `apps/web`) engines.node to `>=24.11.1`

### 2. Upgrade ESLint to v9 following Turborepo best practices

- Update `packages/eslint-config/package.json` to use ESLint v9 as dependency (not peerDependency per Turborepo docs)
- Keep ESLint as dependency in shared config package (Turborepo pattern)
- Update `@typescript-eslint/*` packages to latest v8.x (compatible with ESLint 9)
- Convert ESLint config files to flat config format (ESLint 9 requirement)
- Consider adding `eslint-config-turbo` for Turborepo-specific rules

### 3. Remove duplicate ESLint from apps (Turborepo best practice)

- Remove `eslint` from `apps/api/package.json` devDependencies
- Remove `eslint` from `apps/storage/package.json` devDependencies
- Remove `eslint` from `apps/admin/package.json` devDependencies
- Remove `eslint` from `apps/web/package.json` devDependencies
- Apps should only depend on `@repo/eslint-config` (which provides ESLint)

### 4. Remove deprecated @types/bull

- Remove `@types/bull` from `apps/api/package.json` devDependencies

### 5. Update multer

- Replace `multer@1.4.5-lts.1` with latest maintained version in `apps/storage/package.json`

### 6. Add pnpm overrides for security vulnerabilities

- Add `pnpm.overrides` section to root `package.json` to force patched versions:
- `hono@>=4.10.2` (fixes Hono vulnerabilities)
- `glob@>=10.5.0` (fixes glob command injection)
- `js-yaml@>=4.1.1` (fixes prototype pollution - will be resolved by ESLint upgrade)
- `cookie@>=0.7.0` (fixes cookie vulnerability)

### 7. Update ESLint config files to flat config format

- Convert `packages/eslint-config/base.js` to `eslint.config.js` (flat config)
- Convert `packages/eslint-config/nestjs.js` to flat config format
- Update app-level ESLint configs (`.eslintrc.js`, `.eslintrc.json`) to use flat config format (`eslint.config.js`)

### 8. Ensure Prettier follows Turborepo pattern

- Verify Prettier is in root `package.json` (already present)
- Ensure shared `@repo/prettier-config` is properly configured

### 9. Set up Husky with pre-commit hooks

- Install Husky as devDependency in root `package.json`
- Initialize Husky (create `.husky` directory)
- Create pre-commit hook that runs:
- `turbo run lint` - Lint all apps (must pass)
- `pnpm format:check` - Check formatting across all apps (must pass)
- `turbo run type-check` - Type check all apps (must pass)
- `turbo run test` - Run tests (when added later, should pass)
- `turbo run build` - Build all apps to ensure builds work (must pass)
- Ensure hooks check all apps in the `apps/` folder
- Add `prepare` script to root `package.json` to auto-install Husky hooks

## Files to Modify

- `package.json` (root) - Update engines.node, add pnpm.overrides, add husky devDependency, add prepare script
- `packages/eslint-config/package.json` - Upgrade ESLint to v9, keep as dependency
- `packages/eslint-config/base.js` - Convert to `eslint.config.js` (flat config)
- `packages/eslint-config/nestjs.js` - Convert to flat config format
- `apps/api/package.json` - Remove eslint and @types/bull, update engines.node
- `apps/storage/package.json` - Remove eslint, update multer, update engines.node
- `apps/admin/package.json` - Remove eslint, update engines.node
- `apps/web/package.json` - Remove eslint, update engines.node
- `apps/api/.eslintrc.js` - Convert to `eslint.config.js` (flat config)
- `apps/storage/.eslintrc.json` - Convert to `eslint.config.js` (flat config)
- `apps/admin/.eslintrc.json` - Convert to `eslint.config.js` (flat config)
- `apps/web/.eslintrc.json` or `eslint.config.mjs` - Update to flat config format
- `.husky/pre-commit` - Create pre-commit hook script (new file)

### To-dos

- [x] Update Node.js version to >=24.11.1 in all package.json files (root and all apps)
- [x] Upgrade ESLint to v9 and update TypeScript ESLint packages in packages/eslint-config/package.json (keep as dependency per Turborepo pattern)
- [x] Convert ESLint config files (base.js, nestjs.js) to flat config format (eslint.config.js) for ESLint 9 compatibility
- [x] Remove duplicate ESLint installations from all app package.json files (api, storage, admin, web)
- [x] Remove deprecated @types/bull from apps/api/package.json
- [x] Update or replace deprecated multer package in apps/storage/package.json
- [x] Add pnpm.overrides section to root package.json to force patched versions of vulnerable dependencies (hono, glob, cookie)
- [ ] Update app-level ESLint config files to work with new flat config format (eslint.config.js)
- [ ] Install Husky, create .husky directory, and set up pre-commit hook that runs lint, format:check, type-check, test, and build for all apps
