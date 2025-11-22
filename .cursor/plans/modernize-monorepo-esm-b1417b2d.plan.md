<!-- b1417b2d-ca96-49c5-8008-2781e43b9b10 13f7b51e-ae5f-4ce9-9a1a-c6abeccab6d1 -->

# Modernize Monorepo: Convert CommonJS to ESM and Fix All Configurations

## Problem Analysis

The monorepo mixes CommonJS and ESM patterns:

1. **NestJS TypeScript Config** (`packages/typescript-config/nestjs.json`) uses `"module": "commonjs"` instead of modern ESM
2. **Prettier Config** (`packages/prettier-config/index.js`) uses `module.exports` (CommonJS)
3. **Source Files** use `require()` in:

- `apps/web/src/config/env.validation.ts`
- `apps/admin/src/config/env.ts`
- `apps/admin/tailwind.config.ts`

4. **Package.json files** missing `"type": "module"` for ESM support
5. **Inconsistent module systems** across apps

## Solution Strategy

Convert everything to modern ESM while maintaining compatibility with:

- NestJS (can work with ESM in Node 24+)
- Next.js (already uses ESM)
- Express/Storage app (already uses ESM imports)

## Implementation Steps

### Phase 1: Fix Shared Package Configurations

1. **Convert Prettier Config to ESM**

- File: `packages/prettier-config/index.js`
- Change `module.exports` to `export default`
- Add `"type": "module"` to `packages/prettier-config/package.json`

2. **Update NestJS TypeScript Config**

- File: `packages/typescript-config/nestjs.json`
- Change `"module": "commonjs"` to `"NodeNext"`
- Change `"moduleResolution": "node"` to `"NodeNext"`
- Update target to ES2022 for consistency

### Phase 2: Fix App-Level Configurations

3. **API App (NestJS)**

- Add `"type": "module"` to `apps/api/package.json`
- Update `apps/api/tsconfig.json` to ensure it extends the updated nestjs.json
- Verify build output uses `.js` extensions (ESM requirement)
- Update start script if needed: `node dist/src/main.js` → ensure ESM compatibility

4. **Storage App (Express)**

- Add `"type": "module"` to `apps/storage/package.json`
- Verify all imports use `.js` extensions (already appears correct)
- Ensure tsconfig uses NodeNext module resolution

5. **Web App (Next.js)**

- Fix `apps/web/src/config/env.validation.ts`: Replace `require('zod')` with `import { z } from 'zod'`
- Next.js already handles ESM, but ensure consistency

6. **Admin App (Next.js)**

- Fix `apps/admin/src/config/env.ts`: Replace `require('zod')` with `import { z } from 'zod'`
- Fix `apps/admin/tailwind.config.ts`: Replace `require('tailwindcss-animate')` with dynamic import or keep as-is (config files can use require)

### Phase 3: Verify and Fix Scripts

7. **Ensure All Apps Have Required Scripts**

- **Lint**: Verify all apps have `lint` and `lint:fix` scripts
- **Format**: Verify all apps have `format` and `format:check` scripts
- **Test**:
- API: Has Jest config ✓
- Storage: Currently has placeholder, add proper test setup or keep placeholder
- Web/Admin: Add test scripts if needed (Next.js testing)
- **Build**: All apps have build scripts ✓
- **Type-check**: All apps have type-check scripts ✓

8. **Update Turbo.json**

- Ensure all tasks (lint, format, test, build, type-check) are properly configured
- Verify dependencies are correct

### Phase 4: Testing and Validation

9. **Run Validation Commands**

- `pnpm lint` - Should pass for all apps
- `pnpm format:check` - Should pass
- `pnpm type-check` - Should pass
- `pnpm test` - Should pass (or gracefully handle missing tests)
- `pnpm build` - Should pass for all apps

10. **Update Documentation**

- Update README.md with modern ESM information
- Document the module system used
- Update any CommonJS references

## Files to Modify

### Shared Packages

- `packages/prettier-config/index.js` - Convert to ESM
- `packages/prettier-config/package.json` - Add `"type": "module"`
- `packages/typescript-config/nestjs.json` - Update to NodeNext

### Apps

- `apps/api/package.json` - Add `"type": "module"`
- `apps/storage/package.json` - Add `"type": "module"`
- `apps/web/src/config/env.validation.ts` - Replace require with import
- `apps/admin/src/config/env.ts` - Replace require with import
- `apps/admin/tailwind.config.ts` - Handle require (config files can keep require)

### Documentation

- `README.md` - Update with ESM information

## Notes

- NestJS with ESM requires Node.js 20+ (project already requires 24.11.1 ✓)
- Next.js config files (tailwind.config.ts) can use CommonJS require() - this is acceptable
- All TypeScript source files should use ESM imports/exports
- Build outputs should use `.js` extensions for ESM compatibility
