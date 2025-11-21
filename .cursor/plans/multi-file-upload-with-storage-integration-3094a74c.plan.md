<!-- 3094a74c-e56e-4793-a867-9f97d7406825 faf3d0e4-da2c-4980-8f43-d902d87e943c -->

# Multi-File Upload with Storage Service Integration

## Overview

Transform the single file upload component into a multi-file upload system with progress tracking, integrate with the storage service API, and ensure form submission only occurs after all files are uploaded.

## Implementation Steps

### 1. Add Storage Service Configuration

- **File**: `apps/admin/src/config/env.ts`
- Add `NEXT_PUBLIC_STORAGE_BASE_URL` environment variable validation (optional, defaults to `http://localhost:5001`)
- Export `storageBaseUrl` constant following same pattern as `apiBaseUrl`:
- Validate server-side with zod (optional field)
- Use directly client-side from `process.env.NEXT_PUBLIC_STORAGE_BASE_URL`
- Default to `http://localhost:5001` if not provided

### 2. Create File Upload API Function

- **File**: `apps/admin/src/apis/index.ts`
- Add `uploadFileToStorage()` function that:
- **Parameters**: `file: File`, `folderName?: string`, `fileName?: string`, `isConvertToWebp?: boolean`, `onUploadProgress?: (progress: number) => void`
- **Endpoint**: `POST {storageBaseUrl}/api/v1/content/files` (note: `/api` prefix is part of the endpoint path)
- Uses FormData for multipart/form-data upload with fields: `file` (required), `folderName`, `fileName`, `isConvertToWebp`
- Supports upload progress tracking via axios `onUploadProgress` callback (receives ProgressEvent, calculate percentage)
- Returns promise resolving to `{ url: string, localUrl: string }` from `response.data.data` (response structure: `{ statusCode: 200, data: { url, localUrl }, message: string }`)
- Handles authentication using existing cookie-based auth (Bearer token from cookies via `getHeaders()`)
- Uses `storageBaseUrl` from env config (not `apiBaseUrl`)

### 3. Enhance File Upload Component

- **File**: `apps/admin/src/components/global/file-upload.tsx`
- **Changes**:
- Change `value` prop to accept `string[]` (array of URLs) or `File[]` (array of files)
- Add `multiple` prop (default: true) to enable/disable multiple selection
- Add `allowedExtensions` prop to specify file types (single type or array)
- Replace single file state with array: `selectedFiles: Array<{ file: File | null, preview: string | null, url?: string, progress?: number, status?: 'pending' | 'uploading' | 'success' | 'error' }>`
- Update file input to support `multiple` attribute
- Add progress bar component for each file showing upload percentage
- Display previews for images (both new files and existing URLs)
- Show file icons for non-image files
- Add remove button for each file
- Add `onUploadStart`, `onUploadProgress`, `onUploadComplete`, `onUploadError` callbacks
- Expose `uploadFiles()` method via ref or callback to trigger uploads
- Store uploaded URLs in component state and pass to formik via `setFieldValue`

### 4. Update GenericFormGenerator Interface

- **File**: `apps/admin/src/components/global/GenericFormGenerator.tsx`
- **Changes to IField interface**:
- Add `multiple?: boolean` to file-select field type (default: true)
- Add `allowedExtensions?: string[]` to specify file extensions (e.g., `['jpg', 'png']` or `['pdf', 'docx']`)
- Add `folderName?: string` for storage folder organization
- Add `storageBaseUrl?: string` to optionally override storage URL
- **Changes to file-select rendering**:
- Pass `multiple` prop to FileSelectField
- Pass `allowedExtensions` prop
- Handle array values in formik (initialize with empty array if null)
- Add upload trigger mechanism before form submission

### 5. Implement Upload-Before-Submit Logic

- **File**: `apps/admin/src/components/global/GenericFormGenerator.tsx`
- **Changes**:
- In `onSubmit` handler, before processing form values:
- Identify all file-select fields that have pending uploads
- Trigger upload for each file-select field using exposed upload method
- Wait for all uploads to complete (Promise.all)
- Update formik values with uploaded URLs (arrays)
- Only proceed with form submission after all uploads succeed
- Show error if any upload fails and prevent submission
- Add loading state during upload process
- Disable submit button while uploads are in progress

### 6. Update File Upload Component Props Usage

- **File**: `apps/admin/src/components/global/GenericFormGenerator.tsx`
- Update FileSelectField instantiation (lines 452-470):
- Pass `multiple={field.multiple ?? true}`
- Pass `allowedExtensions={field.allowedExtensions}`
- Pass `folderName={field.folderName}`
- Handle value as array: `value={Array.isArray(formik.values[field.name]) ? formik.values[field.name] : formik.values[field.name] ? [formik.values[field.name]] : []}`
- Add ref or callback to access upload method
- Pass `onUploadComplete` callback to update formik values

### 7. Add Progress UI Components

- **File**: `apps/admin/src/components/global/file-upload.tsx`
- Add progress bar component using shadcn/ui Progress component or custom div
- Show upload status indicators (pending, uploading, success, error)
- Display file size and type information
- Add cancel upload functionality (optional)

### 8. Handle Edge Cases

- Empty file arrays (initialize as empty array)
- Mix of existing URLs and new files
- File validation (size, type) before upload
- Error handling and retry mechanism
- Cleanup of failed uploads from state

## Technical Details

### Storage API Integration

- Endpoint: `POST /api/v1/content/files`
- Content-Type: `multipart/form-data`
- Form fields: `file`, `folderName`, `fileName`, `allowedExtensions`, `isConvertToWebp`
- Response: `{ statusCode: 200, data: { url: string, localUrl: string }, message: string }`
- Authentication: JWT token from cookies (same as other API calls)

### File Upload Flow

1. User selects files → stored in component state as File objects
2. User clicks submit → GenericFormGenerator intercepts
3. GenericFormGenerator triggers uploads for all file-select fields
4. Each file uploads with progress tracking
5. On completion, URLs are stored in formik values
6. Form submission proceeds with URL arrays

### Value Format

- Initial value: `string[]` (array of URLs) or `null`
- During selection: `File[]` (array of File objects)
- After upload: `string[]` (array of URLs from storage)
