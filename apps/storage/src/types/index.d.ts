import { Request } from 'express';

export interface JwtPayload {
  iss: string;
  sub: string;
  email: string;
  [key: string]: unknown;
}

export interface FileUploadRequest extends Request {
  file?: Express.Multer.File;
}

export interface SuccessResponse<T = unknown> {
  statusCode: 200 | 201;
  data: T;
  message?: string;
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error?: unknown;
}

export interface FileUploadOptions {
  folderName?: string | null;
  fileName?: string | null;
  allowedExtensions?: string[];
  isConvertToWebp?: boolean;
  quality?: number;
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

export interface WebpOptions {
  quality?: number;
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

export interface FolderInfo {
  name: string;
  path: string;
  url: string;
}

export interface FileInfo {
  name: string;
  url: string;
  localUrl?: string;
}

export interface FolderDetails {
  name: string;
  files: FileInfo[];
  fileCount: number;
}

export interface ServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: Error | unknown;
}

