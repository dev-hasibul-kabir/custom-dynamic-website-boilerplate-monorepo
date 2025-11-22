import fs from 'node:fs';
import path, { extname } from 'node:path';
import envVariables from './env.js';
import logger from './logger.js';

interface MulterFile {
  originalname: string;
  buffer: globalThis.Buffer;
  mimetype?: string;
  size?: number;
}

/* eslint-disable no-unused-vars */
interface FileUtil {
  validateFile: (file: MulterFile | null | undefined) => void;
  getFileExtension: (fileName: string) => string;
  saveFile: (fileName: string, fileExtension: string, file: MulterFile) => Promise<string>;
  getFile: (fileName: string) => string;
  checkFileExists: (fileName: string) => boolean;
  deleteFile: (fileNameWithExtension: string) => Promise<boolean>;
}
/* eslint-enable no-unused-vars */

export const fileUtil: FileUtil = {
  validateFile(file: MulterFile | null | undefined): void {
    if (!file || !file.originalname || !file.buffer) {
      throw {
        name: 'badRequest',
        message: 'File is required!',
      };
    }
  },

  getFileExtension: (fileName: string): string => {
    return extname(fileName);
  },

  saveFile(fileName: string, fileExtension: string, file: MulterFile): Promise<string> {
    const dirPath = envVariables.ATTACHMENT_FOLDER_PATH;

    return new Promise((resolve, reject) => {
      try {
        // Ensure directory exists
        fs.mkdirSync(dirPath, {
          recursive: true,
        });

        const filePath = path.join(dirPath, fileName + fileExtension);

        // Write buffer directly to file (multer memoryStorage provides buffer)
        fs.writeFile(filePath, file.buffer, err => {
          if (err) {
            logger.error('file.ts: fs.writeFile -> error', err);
            reject(err);
            return;
          }

          resolve(fileName + fileExtension);
        });
      } catch (err) {
        logger.error('file.ts: saveFile -> error', err);
        reject(err);
      }
    });
  },

  getFile: (fileName: string): string => path.join(envVariables.ATTACHMENT_FOLDER_PATH, fileName),

  checkFileExists: (fileName: string): boolean => {
    try {
      const filePath = path.join(envVariables.ATTACHMENT_FOLDER_PATH, fileName);
      return fs.existsSync(filePath);
    } catch (error) {
      logger.error('file.ts: checkFileExists', error);
      throw error;
    }
  },

  deleteFile: (fileNameWithExtension: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const filePath = path.join(envVariables.ATTACHMENT_FOLDER_PATH, fileNameWithExtension);

      fs.unlink(filePath, e => {
        if (e) {
          logger.error('file.ts: deleteFile', e);
          reject(e);
          return;
        }

        resolve(true);
      });
    });
  },
};
