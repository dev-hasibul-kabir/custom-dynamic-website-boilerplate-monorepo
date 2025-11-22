<!-- fd58736d-b038-413b-a954-ec17d46aebb6 4585ee3d-cfd4-4595-b0e7-dbd6a440483c -->

# Fix NestJS TypeScript Configuration to CommonJS

## Problem

The API codebase has a configuration mismatch with NestJS best practices:

- `package.json` has `` (forces ES modules)
- TypeScript config uses `"module": "NodeNext"` (requires `.js` extensions for ES modules)
- But NestJS uses CommonJS by default (no `.js` extensions needed)
- This creates inconsistent imports: some files have `.js` extensions, some don't
- Path aliases (`@/...`) work but the overall setup is non-standard for NestJS

**Root Cause**: NestJS traditionally uses CommonJS module system. The ``and`NodeNext` configuration forces ES module requirements (`.js` extensions) when NestJS doesn't need them. The compiled output already shows CommonJS format, confirming the mismatch.

## Solution

Align configuration with NestJS official best practices:

1. **Remove ``** from `package.json` (use CommonJS - NestJS default)
2. **Change TypeScript config** from `NodeNext` to `CommonJS` module system
3. **Remove all `.js` extensions** from relative imports (not needed for CommonJS)
4. **Keep path aliases (`@/...`)** working as they are (they work with both systems)
5. **Verify start script** uses correct entry point

## Files to Fix

### Configuration Files

- `apps/api/package.json`: Remove ``, verify start script points to `.js` file
- `packages/typescript-config/nestjs.json`: Change `module` from `"NodeNext"` to `"commonjs"` and `moduleResolution` from `"NodeNext"` to `"node"`

### Source Files (Remove .js extensions from relative imports)

All TypeScript files in `src/` that have `.js` in relative imports (found ~30+ files):

- `src/main.ts`: Remove `.js` from `'./app.module'` if present
- `src/app.module.ts`: Remove `.js` from relative imports
- `src/modules/**/*.ts`: Remove `.js` from all relative imports
- `src/util/**/*.ts`: Remove `.js` from all relative imports
- `src/common/**/*.ts`: Remove `.js` from all relative imports
- `src/db/**/*.ts`: Remove `.js` from all relative imports
- `src/config/**/*.ts`: Remove `.js` from all relative imports

**Keep path aliases (`@/...`) unchanged** - they work fine without extensions

## Implementation Steps

1. **Update base TypeScript config**: Change `packages/typescript-config/nestjs.json` to use CommonJS
2. **Update package.json**: Remove ``from`apps/api/package.json`
3. **Remove .js extensions**: Systematically remove all `.js` extensions from relative imports in source files
4. **Verify path aliases**: Ensure `@/` imports continue working (they should)
5. **Test build**: Run type-check and build to ensure everything compiles correctly

## Technical Notes

- NestJS defaults to CommonJS, which doesn't require file extensions in imports
- Path aliases work with both CommonJS and ES modules via TypeScript path mapping
- CommonJS uses `require()` and `module.exports` at runtime (what NestJS compiles to)
- This aligns with NestJS official documentation and standard practices
- The compiled output already shows CommonJS format, so this matches reality

### To-dos

- [ ] Update packages/typescript-config/nestjs.json to use 'commonjs' module and 'node' moduleResolution
- [ ] Remove 'type': 'module' from apps/api/package.json
- [ ] Remove all .js extensions from relative imports in all TypeScript source files
- [ ] Verify that @/ path aliases continue working correctly
- [ ] Run type-check and build to verify everything works
