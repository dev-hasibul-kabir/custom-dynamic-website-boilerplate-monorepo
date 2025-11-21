<!-- 4589e420-3688-4470-8215-48d35cca3dc1 ad0cc39e-a680-4db0-877f-c58f4f3a07e7 -->

# Storage App Simplification Plan

## Overview

Transform the storage app from a folder-based file management system to a simple file upload module with CRUD operations only. Remove all folder management, UI views, webp conversion. Implement JWT authentication for create/delete operations only (read operations remain public). Use clean `/files` route structure.

## Key Changes

### 1. Fix Linter & Formatter Configuration

- Verify `.eslintrc.json` extends `@repo/eslint-config/node`
- Verify `.prettierrc` uses `@repo/prettier-config`
- Fix TypeScript config issues (rootDir conflicts)
- Run linter and formatter to fix existing issues

### 2. Remove Folder Management

- Delete `apps/storage/src/services/folder.ts`
- Delete `apps/storage/src/routes/folder/index.ts`
- Remove folder routes from `apps/storage/src/routes/index.ts`
- Remove folder-related types from `apps/storage/src/types/index.d.ts`

### 3. Remove UI/Views

- Delete `apps/storage/src/routes/ui/index.ts`
- Delete entire `apps/storage/src/views/` directory
- Remove handlebars engine setup from `apps/storage/src/index.ts`
- Remove UI routes registration
- Remove `express-handlebars` dependency (if not used elsewhere)

### 4. JWT Authentication Setup

**Authentication Requirements:**

- Use same JWT_SECRET from backend API (already configured)
- JWT validation already matches backend (issuer: 'example.com', subject === email)
- Current `apps/storage/src/middlewares/auth.ts` and `apps/storage/src/utils/jwt.ts` are already compatible
- Apply `authMiddleware` to CREATE (POST) and DELETE operations only
- Keep GET/READ operations public (no authentication required)

### 5. Simplify File Service & Route Structure

**Selected Route Structure: `/files`**

- `POST /files` - Upload file (multipart/form-data, file field only) **[AUTH REQUIRED]**
  - Returns: `{ url: string, localUrl: string }`
- `GET /files/:fileName` - Get file (public, no auth)
- `DELETE /files/:fileName` - Delete file **[AUTH REQUIRED]**

**File Structure:**

- Files stored directly in `ATTACHMENT_FOLDER_PATH` (no subfolders)
- Filenames: random 16-character string + original extension
- Example: `a3f9b2c1d4e5f6g7.pdf`

**Changes to `apps/storage/src/services/file.ts`:**

- Remove `folderName`, `fileName`, `allowedExtensions` parameters
- Remove webp/webm conversion logic
- Generate random 16-character filename before save using `crypto.randomBytes(8).toString('hex')`
- Store files directly in `ATTACHMENT_FOLDER_PATH`
- Simplify `uploadFile` to only accept multipart file
- Remove `updateFile` and `listFiles` functions
- Simplify `fetchFile` to use fileName only (no folderName)
- Simplify `deleteFile` to use fileName only

**Changes to `apps/storage/src/utils/file.ts`:**

- Remove folder-based file operations
- Remove webp conversion functions
- Simplify `saveFile` to save directly to root directory
- Update `getFile` to work without folderName
- Update `checkFileExists` to work without folderName
- Remove `validateFile` allowedExtensions check (or make it optional)

### 6. Update Routes

**File: `apps/storage/src/routes/file/index.ts`**

- Update POST route to `/files` with `authMiddleware` (no folderName)
- Update GET route to `/files/:fileName` (public, no auth)
- Update DELETE route to `/files/:fileName` with `authMiddleware`
- Remove PUT route (updateFile)
- Remove GET list files route
- Update Swagger documentation

### 7. Simplify Health API

**File: `apps/storage/src/routes/health.ts`**

- Simplify to basic status check
- Remove complex attachment directory checks
- Return simple `{ status: 'ok' }` or minimal info

### 8. Update Swagger Configuration

**File: `apps/storage/src/config/swagger.ts`**

- Remove folder-related schemas and tags
- Update description to reflect file-only storage
- Remove WebP conversion documentation
- Update route examples to `/files`

### 9. Clean Up Types

**File: `apps/storage/src/types/index.d.ts`**

- Remove `FolderInfo`, `FolderDetails` interfaces
- Remove `FileUploadOptions` (or simplify to just file)
- Remove `WebpOptions` interface
- Keep `FileInfo` but simplify (remove folderName references)

### 10. Update Main App File

**File: `apps/storage/src/index.ts`**

- Remove handlebars engine setup
- Remove views directory setup
- Remove UI routes
- Remove folder routes
- Keep only file routes and health route
- Simplify static file serving (if needed)

### 11. Logger Verification

- Check `apps/storage/src/config/winston.ts` import path (fix `@/utils/env.js` if needed)
- Verify logger works in all service functions
- Test error logging

### 12. Clean Up Dependencies

- Remove `express-handlebars` from package.json (if not needed)
- Keep `sharp` for now (may be used later, but remove webp conversion code)
- Keep other dependencies as they may be needed

### 13. Remove Unused Files

- Delete `apps/storage/src/middlewares/validation.ts` (if unused)
- Delete `apps/storage/src/middlewares/validationMiddleware.ts` (if unused)
- Clean up any other unused utilities

## Cool File Server Feature Ideas (Future Enhancements)

### Core Features (Current Implementation)

1. **Simple File Storage** - Store files with random hash-based names
2. **Public File Access** - Direct URL access without authentication
3. **Secure Upload/Delete** - JWT-protected write operations

### Proposed Future Features

1. **File Metadata Storage** - Store original filename, upload date, file size, MIME type
2. **File Expiration/TTL** - Auto-delete files after specified time
3. **File Size Limits & Quotas** - Per-user upload limits and total storage quota
4. **File Versioning** - Keep multiple versions of same file with rollback
5. **File Access Logging** - Track file downloads/access with analytics
6. **File Compression** - Automatic compression for large files
7. **Thumbnail Generation** - Auto-generate thumbnails for images with multiple sizes
8. **File Sharing & Permissions** - Share files with specific users, access control lists
9. **Bulk Operations** - Upload/delete multiple files at once
10. **File Search & Filtering** - Search by original filename, filter by type/size/date
11. **CDN Integration** - Optional CDN for file delivery with cache invalidation
12. **File Streaming** - Stream large files with range request support for video/audio

## Implementation Order

1. Fix linter/formatter config and TypeScript issues
2. Remove folder management (services, routes, types)
3. Remove UI/views (routes, views directory, handlebars setup)
4. Verify JWT auth compatibility with backend API
5. Simplify file service (remove folder logic, webp conversion, add random filename)
6. Update file routes to `/files` structure with auth on create/delete only
7. Update swagger documentation
8. Simplify health API
9. Update types
10. Update main app file
11. Verify logger
12. Clean up unused files and dependencies
13. Test all endpoints

## Files to Modify

- `apps/storage/src/services/file.ts` - Complete rewrite
- `apps/storage/src/utils/file.ts` - Simplify significantly
- `apps/storage/src/routes/file/index.ts` - Update routes to `/files` with auth
- `apps/storage/src/routes/index.ts` - Remove folder routes
- `apps/storage/src/index.ts` - Remove UI setup
- `apps/storage/src/config/swagger.ts` - Update documentation
- `apps/storage/src/routes/health.ts` - Simplify
- `apps/storage/src/types/index.d.ts` - Remove folder types
- `apps/storage/src/middlewares/auth.ts` - Verify compatibility (already compatible)
- `apps/storage/src/utils/jwt.ts` - Verify compatibility (already compatible)
- `apps/storage/tsconfig.json` - Fix rootDir issue

## Files to Delete

- `apps/storage/src/services/folder.ts`
- `apps/storage/src/routes/folder/index.ts`
- `apps/storage/src/routes/ui/index.ts`
- `apps/storage/src/views/` (entire directory)
- Unused middleware files (if any)

## Random Filename Generation

Use crypto to generate 16-character random string:

```typescript
import crypto from "node:crypto";
const randomName = crypto.randomBytes(8).toString("hex"); // 16 chars
const fileName = `${randomName}${fileExtension}`;
```

### To-dos

- [ ] Fix linter and formatter configuration, resolve TypeScript rootDir issues
- [ ] Delete folder service, routes, and related types
- [ ] Delete UI routes, views directory, and handlebars setup
- [ ] Rewrite file service to remove folder logic, webp conversion, add random filename generation
- [ ] Simplify file utilities to work without folders
- [ ] Update file routes to new simplified API structure
- [ ] Update Swagger documentation to reflect file-only API
- [ ] Simplify health API endpoint
- [ ] Remove folder-related types and simplify file types
- [ ] Remove UI setup and folder routes from main app file
- [ ] Fix logger import paths and verify functionality
- [ ] Remove unused middleware files and dependencies
