// file-upload.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface IResponseData {
  statusCode: number;
  message: string;
  data?: unknown;
  error?: unknown;
}

@Injectable()
export class FileUploadService {
  @Inject()
  private readonly config: ConfigService;

  async uploadFileToS2(
    file: Express.Multer.File,
    authorization: string,
    foldername?: string | null,
    filename?: string | null,
    allowedExtensions?: string[],
    isConvertToWebp = false,
  ): Promise<IResponseData> {
    // console.debug({ file });

    const formData = new FormData();
    formData.append('file', new Blob([file.buffer]), file.originalname);
    if (foldername) formData.append('folderName', foldername);
    if (filename) formData.append('fileName', filename);
    if (allowedExtensions) {
      allowedExtensions.forEach(extension => formData.append('allowedExtensions', extension));
    }
    if (isConvertToWebp !== false) {
      formData.append('isConvertToWebp', 'true');
    }

    const response = await axios.post(this.config.get('S2_FILE_CREATE_URL'), formData, {
      headers: { 'Content-Type': 'multipart/form-data', Authorization: authorization },
    });

    if (response.status === 200) {
      return response.data as IResponseData; // You can return the response from the API if needed
    }

    throw new Error('File upload failed');
  }

  async editFileIntoS2(
    url: string,
    file: Express.Multer.File,
    authorization: string,
    foldername?: string | null,
    filename?: string | null,
    allowedExtensions?: string[],
  ): Promise<IResponseData> {
    // console.debug({ file });

    const formData = new FormData();
    formData.append('file', new Blob([file.buffer]), file.originalname);
    if (foldername) formData.append('folderName', foldername);
    if (filename) formData.append('fileName', filename);
    if (allowedExtensions) {
      allowedExtensions.forEach(extension => formData.append('allowedExtensions[]', extension));
    }

    const response = await axios.put(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data', Authorization: authorization },
    });

    if (response.status === 200) {
      return response.data as IResponseData;
    }

    throw new Error('File update failed');
  }

  async removeFileFromS2(url: string, authorization: string): Promise<IResponseData> {
    const response = await axios.delete(url, {
      headers: { Authorization: authorization },
    });

    if (response.status === 200) {
      return response.data as IResponseData;
    }

    throw new Error('File deletion failed');
  }
}
