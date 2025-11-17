import slugify from 'slugify';
import fs from 'node:fs';
import path from 'node:path';
import type { Request, Response } from 'express';
import { fileUtil } from '../utils/file.js';
import envVariables from '../utils/env.js';
import logger from '../utils/logger.js';
import { success, error } from '../utils/response.js';
import type { FileUploadOptions, WebpOptions, FileInfo } from '../types/index.js';

const {
  validateFile,
  getFileExtension,
  getFileNameWithoutExtension,
  checkFileExists,
  saveFile,
  getFile,
  deleteFile: deleteFileUtil,
} = fileUtil;

const tag = 'services/file.ts';

// upload file
export const uploadFile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      folderName = null,
      fileName = null,
      allowedExtensions = [
        'jpeg',
        'jpg',
        'png',
        'webp',
        'gif',
        'mp4',
        'webm',
        'pdf',
        'docx',
        'doc',
      ],
      isConvertToWebp = false,
      quality,
      width,
      height,
      fit,
    } = req.body as FileUploadOptions;
    const file = req.file;

    if (!file) {
      res.status(400).json(
        error({
          name: 'badRequest',
          message: 'File is required!',
        }),
      );
      return;
    }

    validateFile(file, allowedExtensions);

    const fileExtension = getFileExtension(file.originalname);
    const originalFileNameWithoutExtension =
      getFileNameWithoutExtension(file.originalname);

    const sanitizedFolderName = slugify(!folderName ? 'root' : folderName, {
      strict: true,
    });

    const sanitizedFileName =
      slugify(!fileName ? originalFileNameWithoutExtension : fileName, {
        strict: true,
      }) +
      '_' +
      Date.now();

    const webpOptions: WebpOptions = {
      quality: quality ? Number.parseInt(String(quality), 10) : 80,
      width: width ? Number.parseInt(String(width), 10) : undefined,
      height: height ? Number.parseInt(String(height), 10) : undefined,
      fit: (fit as WebpOptions['fit']) || 'inside',
    };

    const savedFileName = await saveFile(
      sanitizedFolderName,
      sanitizedFileName,
      fileExtension,
      file,
      isConvertToWebp,
      webpOptions,
    );

    const finalFileName =
      isConvertToWebp && savedFileName.endsWith('.webp')
        ? savedFileName
        : sanitizedFileName + fileExtension;

    const result = success<{ url: string; localUrl: string }>(
      {
        url:
          envVariables.PUBLIC_URL +
          `/api/v1/content/folders/${sanitizedFolderName}/files/${finalFileName}`,
        localUrl:
          envVariables.LOCAL_URL +
          `/api/v1/content/folders/${sanitizedFolderName}/files/${finalFileName}`,
      },
      'File upload success!',
    );

    res.status(200).json(result);
  } catch (err) {
    logger.error(tag + ': uploadFile', err);
    res.status(400).json(error(err as Error));
  }
};

// get file
export const fetchFile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { folderName, fileName } = req.params as {
      folderName: string;
      fileName: string;
    };
    const { webp, quality, width, height, fit } = req.query as {
      webp?: string;
      quality?: string;
      width?: string;
      height?: string;
      fit?: string;
    };

    const filePath = getFile(folderName, fileName);

    if (!checkFileExists(folderName, fileName)) {
      res.status(404).json(
        error({
          name: 'notFound',
          message: 'File not found!',
        }),
      );
      return;
    }

    // Handle WebP conversion via query params for image files
    if (webp === 'true') {
      const fileExtension = getFileExtension(fileName).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(fileExtension)) {
        const webpOptions: WebpOptions = {
          quality: quality ? Number.parseInt(quality, 10) : 80,
          width: width ? Number.parseInt(width, 10) : undefined,
          height: height ? Number.parseInt(height, 10) : undefined,
          fit: (fit as WebpOptions['fit']) || 'inside',
        };

        const outputFileName = fileName.replace(fileExtension, '.webp');
        const outputPath = getFile(folderName, outputFileName);

        // Check if WebP version already exists, if not create it
        if (!fs.existsSync(outputPath)) {
          await fileUtil.convertToWebp(filePath, outputPath, webpOptions);
        }

        res.setHeader('Content-Type', 'image/webp');
        res.sendFile(path.resolve(outputPath));
        return;
      }
    }

    res.sendFile(path.resolve(filePath));
  } catch (err) {
    logger.error(tag + ': fetchFile', err);
    res.status(500).json(error(err as Error));
  }
};

// list files in folder
export const listFiles = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { folderName } = req.params as { folderName: string };

    const folderPath = path.join(
      envVariables.ATTACHMENT_FOLDER_PATH,
      folderName,
    );

    if (!fs.existsSync(folderPath)) {
      res.status(404).json(
        error({
          name: 'notFound',
          message: 'Folder not found!',
        }),
      );
      return;
    }

    const items = fs.readdirSync(folderPath);
    const files = items.filter((item) => {
      const itemPath = path.join(folderPath, item);
      return fs.statSync(itemPath).isFile();
    });
    const fileList: FileInfo[] = files.map((file) => ({
      name: file,
      url: `${envVariables.PUBLIC_URL}/api/v1/content/folders/${folderName}/files/${file}`,
      localUrl: `${envVariables.LOCAL_URL}/api/v1/content/folders/${folderName}/files/${file}`,
    }));

    res.status(200).json(success(fileList, 'Files retrieved successfully'));
  } catch (err) {
    logger.error(tag + ': listFiles', err);
    res.status(500).json(error(err as Error));
  }
};

// update file
export const updateFile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { folderName: oldFolderName, fileName: oldFileName } = req.params as {
      folderName: string;
      fileName: string;
    };
    const {
      folderName: newFolderName = null,
      fileName: newFileName = null,
      allowedExtensions = [
        'jpeg',
        'jpg',
        'png',
        'webp',
        'gif',
        'mp4',
        'webm',
        'pdf',
        'docx',
        'doc',
      ],
      isConvertToWebp = false,
      quality,
      width,
      height,
      fit,
    } = req.body as FileUploadOptions;
    const file = req.file;

    if (!file) {
      res.status(400).json(
        error({
          name: 'badRequest',
          message: 'File is required!',
        }),
      );
      return;
    }

    validateFile(file, allowedExtensions);

    const isFileExists = checkFileExists(oldFolderName, oldFileName);

    if (!isFileExists) {
      res.status(404).json(
        error({
          name: 'notFound',
          message: 'File not found to replace!',
        }),
      );
      return;
    }

    await deleteFileUtil(oldFolderName, oldFileName);

    const fileExtension = getFileExtension(file.originalname);
    const originalFileNameWithoutExtension =
      getFileNameWithoutExtension(file.originalname);

    const sanitizedNewFolderName = slugify(
      !newFolderName ? oldFolderName : newFolderName,
      {
        strict: true,
      },
    );

    const sanitizedNewFileName =
      slugify(
        !newFileName ? originalFileNameWithoutExtension : newFileName,
        {
          strict: true,
        },
      ) +
      '_' +
      Date.now();

    const webpOptions: WebpOptions = {
      quality: quality ? Number.parseInt(String(quality), 10) : 80,
      width: width ? Number.parseInt(String(width), 10) : undefined,
      height: height ? Number.parseInt(String(height), 10) : undefined,
      fit: (fit as WebpOptions['fit']) || 'inside',
    };

    const savedFileName = await saveFile(
      sanitizedNewFolderName,
      sanitizedNewFileName,
      fileExtension,
      file,
      isConvertToWebp,
      webpOptions,
    );

    const finalFileName =
      isConvertToWebp && savedFileName.endsWith('.webp')
        ? savedFileName
        : sanitizedNewFileName + fileExtension;

    const result = success<{ url: string; localUrl: string }>(
      {
        url:
          envVariables.PUBLIC_URL +
          `/api/v1/content/folders/${sanitizedNewFolderName}/files/${finalFileName}`,
        localUrl:
          envVariables.LOCAL_URL +
          `/api/v1/content/folders/${sanitizedNewFolderName}/files/${finalFileName}`,
      },
      'File replaced successfully',
    );

    res.status(200).json(result);
  } catch (err) {
    logger.error(tag + ': updateFile', err);
    res.status(400).json(error(err as Error));
  }
};

// delete file
export const deleteFile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { folderName, fileName } = req.params as {
      folderName: string;
      fileName: string;
    };

    const isFileExists = checkFileExists(folderName, fileName);

    if (!isFileExists) {
      res.status(200).json(
        success(null, 'File not found (already deleted)'),
      );
      return;
    }

    await deleteFileUtil(folderName, fileName);

    res.status(200).json(success(null, 'File deleted successfully'));
  } catch (err) {
    logger.error(tag + ': deleteFile', err);
    res.status(500).json(error(err as Error));
  }
};

