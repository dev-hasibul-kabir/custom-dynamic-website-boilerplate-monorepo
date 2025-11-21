<!-- 0c79867a-726e-4a54-b193-6c095516fe4d 6d45b5dd-d820-4722-b230-5ab84a197916 -->

# Sync File Upload Integration - Backend API Best Practices First

## Backend API Changes (Best Practices)

### 1. Update File DTO (`apps/api/src/modules/folder/file/dto/index.ts`)

**Change `folderId` from string to number:**

- Since we're using JSON body (not multipart/form-data), we can send numbers directly
- Change `folderId: string` to `folderId: number`
- Update validation decorator from `@IsString()` to `@IsInt()`
- Import `IsInt` from `class-validator`
- Add `@Type(() => Number)` decorator from `class-transformer` if needed for proper transformation

### 2. Update File Service (`apps/api/src/modules/folder/file/file.service.ts`)

**Remove string-to-number conversion:**

- Remove `parseInt(dto.folderId)` on line 42
- Remove `parseInt(dto.folderId)` on line 57
- Use `dto.folderId` directly as number
- Update validation checks to work with number type (line 19 check is fine)

### 3. Verify File Controller (`apps/api/src/modules/folder/file/file.controller.ts`)

- Already using `@Body() dto: FileDto` which is correct for JSON
- No changes needed

## Frontend UI Changes

### 1. Update Page Component (`apps/admin/src/app/(authenticated)/folders/[id]/files/page.tsx`)

**Form Field Changes:**

- Change file-select field name from `file` to `url` (line 144)
- Set `multiple: false` for single file upload (add to file-select field config)
- Update validation to check `url` instead of `file` (line 150-151)
- Note: `folderName` prop for file-select is optional - storage service defaults to 'root' if not provided, so we don't need to pass it

**Data Transformation:**

- Add `callback` function in `addNew` prop (line 77-79)
- Transform form data before API call:
- Ensure `url` is a string (not array) when `multiple: false` - handle if it comes as array[0]
- Ensure `folderId` is sent as number (not string) - convert if needed
- Remove any `file` field if present

## Implementation Flow

1. User selects file → stored in `url` field as File object
2. On form submit → GenericFormGenerator uploads file to storage → returns URL string
3. File-upload component sets `url` field to string (when multiple=false, converts array[0] to string via line 276: `allUrls[0] || null`)
4. Form data: `{ folderId: number, type: FileType, name: string, url: string, status: GeneralStatus }`
5. API receives JSON with correct types

## Key Changes Summary

**Backend:**

- DTO: `folderId: string` → `folderId: number` with `@IsInt()` validation
- Service: Remove `parseInt()` calls, use `dto.folderId` directly as number

**Frontend:**

- Page: Field name `file` → `url`
- Page: Add `slug` to folder state type
- Page: Pass `folder.slug` as `folderName` to file-select
- Page: Set `multiple: false` for file-select
- Page: Add data transformation callback in `addNew`
- Page: Update validation to check `url` instead of `file`

### To-dos

- [ ] Backend: Update FileDto - Change folderId from string to number, add @IsInt() validation, import IsInt from class-validator
- [ ] Backend: Update FileService - Remove parseInt(dto.folderId) on line 42 and 57, use dto.folderId directly as number
- [ ] Frontend: Update page.tsx - Add slug to folder state type: { id: number; name: string; slug: string }
- [ ] Frontend: Update page.tsx - Change file-select field name from 'file' to 'url' (line 144)
- [ ] Frontend: Update page.tsx - Set multiple: false for file-select field
- [ ] Frontend: Update page.tsx - Add folderName prop to file-select using folder.slug
- [ ] Frontend: Update page.tsx - Update validation to check url instead of file (line 150-151)
- [ ] Frontend: Update page.tsx - Add data transformation callback in addNew prop to ensure url is string (handle array[0]) and folderId is number
