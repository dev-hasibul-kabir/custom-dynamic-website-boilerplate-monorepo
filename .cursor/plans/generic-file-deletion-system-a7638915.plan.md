<!-- a7638915-5cb3-4024-8fae-df54608a262f b3b5904b-031b-4eb3-9866-e530b872f187 -->
# Generic File Deletion System

## Problem Statement

1. **Backend**: When deleting database rows, associated files in storage are not deleted
2. **Frontend**: Files are deleted immediately when removed in edit mode, even if user cancels the form
3. **Generic Solution**: Need to support any table with single/multiple file URL columns (current and future)

## Solution Overview

### Backend Changes

1. **Create Generic File Deletion Utility Service**

   - Location: `apps/api/src/common/services/file-deletion.service.ts`
   - Extract file URLs from any database row (handles single strings, arrays, multiple columns)
   - Extract filename from storage URL (format: `http://base/files/filename.ext`)
   - Make HTTP calls to storage API to delete files
   - Handle errors gracefully (log but don't fail delete operation)

2. **Update File Service**

   - Location: `apps/api/src/modules/folder/file/file.service.ts`
   - In `removeById()`: Before deleting DB row, extract file URL and delete from storage
   - Use the generic file deletion service

3. **Create Reusable Pattern for Other Services**

   - Document pattern for future services to use file deletion utility
   - Pattern: Before DB delete, call `fileDeletionService.deleteFilesFromRow(row)`

### Frontend Changes

1. **Update File Upload Component**

   - Location: `apps/admin/src/components/global/file-upload.tsx`
   - **Single File Mode** (`multiple=false`):
     - Track `oldFileUrl` when editing (from initial value)
     - Don't delete immediately when removed
     - Only delete old file when new file upload completes successfully
     - Delete old file in parallel with new file upload
   - **Multiple File Mode** (`multiple=true`):
     - Show confirmation dialog/tooltip before deleting
     - Track files marked for deletion but don't delete until form is saved
     - If form is cancelled, restore files that were marked for deletion

## Implementation Details

### Backend File Deletion Service

```typescript
// Extract file URLs from row (handles: string, string[], or multiple columns)
extractFileUrls(row: any, fileUrlColumns?: string[]): string[]

// Extract filename from storage URL
extractFileName(fileUrl: string): string

// Delete file from storage via HTTP
deleteFileFromStorage(fileName: string): Promise<void>

// Delete all files from a row
deleteFilesFromRow(row: any, fileUrlColumns?: string[]): Promise<void>
```

### Frontend File Upload Component Changes

- Add `pendingDeletions` state to track files marked for deletion
- Add `oldFileUrl` ref for single file mode
- Modify `removeFile()` to show confirmation for multiple files
- Modify `handleUpload()` to delete old file when new file uploads (single mode)
- Add cleanup on form cancellation

## Files to Modify

**Backend:**

- `apps/api/src/common/services/file-deletion.service.ts` (NEW)
- `apps/api/src/modules/folder/file/file.service.ts` (UPDATE)
- `apps/api/src/common/interfaces/index.ts` (if needed for types)

**Frontend:**

- `apps/admin/src/components/global/file-upload.tsx` (UPDATE)
- `apps/admin/src/components/global/GenericFormGenerator.tsx` (UPDATE - if needed)

## Testing Considerations

1. Test single file deletion on row delete
2. Test multiple file deletion on row delete  
3. Test edit mode: remove file then cancel form (file should not be deleted)
4. Test edit mode: remove file then save (file should be deleted)
5. Test single file: upload new file (old file should be deleted)
6. Test multiple files: remove with confirmation
7. Test error handling: storage API unavailable during delete

## Future Extensibility

- Other services can use `FileDeletionService` by calling `deleteFilesFromRow()` before DB delete
- File URL column detection can be automated via Prisma schema inspection (future enhancement)
- Support for custom file URL patterns (future enhancement)