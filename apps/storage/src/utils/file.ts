import fs from 'node:fs';
import path from 'node:path';
import { extname } from 'node:path';
import sharp from 'sharp';
import type { OutputInfo } from 'sharp';
import type { WebpOptions } from '../types/index.js';
import logger from './logger.js';
import envVariables from './env.js';

interface FileWithName {
  originalname: string;
  pipe: (destination: NodeJS.WritableStream) => void;
  on: (event: string, callback: (error?: Error) => void) => void;
}

const convertImageFileToWebp = (
  inputImagePath: string,
  outputImagePath: string,
  options: WebpOptions = {},
  callback: (error: Error | null, info?: OutputInfo) => void,
): void => {
  const { quality = 80, width, height, fit = 'inside' } = options;
  let sharpInstance = sharp(inputImagePath).toFormat('webp', { quality });

  if (width || height) {
    sharpInstance = sharpInstance.resize(width, height, { fit });
  }

  sharpInstance.toFile(outputImagePath, callback);
};

interface FileUtil {
  validateFile: (
    file: FileWithName | null | undefined,
    allowedExts?: string[],
  ) => void;
  getFileExtension: (fileName: string) => string;
  getFileNameWithoutExtension: (fileName: string) => string;
  saveFile: (
    folderName: string,
    fileName: string,
    fileExtension: string,
    file: FileWithName,
    isConvertToWebp?: boolean,
    webpOptions?: WebpOptions,
  ) => Promise<string>;
  getFile: (folderName: string, fileName: string) => string;
  checkFileExists: (folderName: string, fileName: string) => boolean;
  deleteFile: (folderName: string, fileNameWithExtension: string) => Promise<boolean>;
  convertToWebp: (
    inputPath: string,
    outputPath: string,
    options?: WebpOptions,
  ) => Promise<OutputInfo>;
}

export const fileUtil: FileUtil = {
  validateFile(
    file: FileWithName | null | undefined,
    allowedExts: string[] = [
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
  ): void {
    if (!file || !file.originalname) {
      throw {
        name: 'badRequest',
        message: 'File is required!',
      };
    }

    const fileExt = extname(file.originalname).toLowerCase().slice(1);
    const normalizedAllowedExts = allowedExts.map((ext) =>
      ext.toLowerCase().replace('.', ''),
    );

    if (!normalizedAllowedExts.includes(fileExt)) {
      throw {
        name: 'badRequest',
        message: `Attached file should be ${normalizedAllowedExts.join(' or ')} format`,
      };
    }
  },

  getFileExtension: (fileName: string): string => {
    return extname(fileName);
  },

  getFileNameWithoutExtension: (fileName: string): string => {
    return fileName.replace(extname(fileName), '');
  },

  saveFile(
    folderName: string,
    fileName: string,
    fileExtension: string,
    file: FileWithName,
    isConvertToWebp = false,
    webpOptions: WebpOptions = {},
  ): Promise<string> {
    const dirPath = path.join(envVariables.ATTACHMENT_FOLDER_PATH, folderName);

    return new Promise((resolve, reject) => {
      fs.mkdirSync(dirPath, {
        recursive: true,
      });

      const filePath = path.join(dirPath, fileName + fileExtension);
      const fileStream = fs.createWriteStream(filePath);

      file.on('error', (e?: Error) => {
        logger.error('file.ts: file.on -> error', e);
        reject(e || new Error('File stream error'));
      });

      fileStream.on('error', (e?: Error) => {
        logger.error('file.ts: fileStream.on -> error', e);
        reject(e || new Error('File stream error'));
      });

      file.pipe(fileStream);

      fileStream.on('finish', () => {
        if (
          isConvertToWebp &&
          (fileExtension.toLowerCase() === '.jpg' ||
            fileExtension.toLowerCase() === '.jpeg' ||
            fileExtension.toLowerCase() === '.png')
        ) {
          const newFileName = `${fileName}.webp`;
          const newFilePath = path.join(dirPath, newFileName);

          convertImageFileToWebp(
            filePath,
            newFilePath,
            webpOptions,
            (error, info) => {
              if (error) {
                logger.error('file.ts: convertImageFileToWebp', error);
                reject(error);
                return;
              }

              fs.unlink(filePath, (unlinkError) => {
                if (unlinkError) {
                  logger.error('file.ts: fs.unlink', unlinkError);
                  reject(unlinkError);
                  return;
                }

                resolve(newFileName);
              });
            },
          );
        } else {
          resolve(fileName + fileExtension);
        }
      });
    });
  },

  getFile: (folderName: string, fileName: string): string =>
    path.join(envVariables.ATTACHMENT_FOLDER_PATH, folderName, fileName),

  checkFileExists: (folderName: string, fileName: string): boolean => {
    try {
      const filePath = path.join(
        envVariables.ATTACHMENT_FOLDER_PATH,
        folderName,
        fileName,
      );
      return fs.existsSync(filePath);
    } catch (error) {
      logger.error('file.ts: checkFileExists', error);
      throw error;
    }
  },

  deleteFile: (
    folderName: string,
    fileNameWithExtension: string,
  ): Promise<boolean> => {
    const dirPath = path.join(envVariables.ATTACHMENT_FOLDER_PATH, folderName);

    return new Promise((resolve, reject) => {
      const filePath = path.join(dirPath, fileNameWithExtension);

      fs.unlink(filePath, (e) => {
        if (e) {
          logger.error('file.ts: deleteFile', e);
          reject(e);
          return;
        }

        resolve(true);
      });
    });
  },

  convertToWebp: (
    inputPath: string,
    outputPath: string,
    options: WebpOptions = {},
  ): Promise<OutputInfo> => {
    return new Promise((resolve, reject) => {
      convertImageFileToWebp(inputPath, outputPath, options, (error, info) => {
        if (error) {
          reject(error);
          return;
        }
        if (info) {
          resolve(info);
        } else {
          reject(new Error('WebP conversion failed'));
        }
      });
    });
  },
};

