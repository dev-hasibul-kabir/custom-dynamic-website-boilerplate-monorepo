import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { Request, Response } from 'express';
import { fileUtil } from '../utils/file.js';
import envVariables from '../utils/env.js';
import logger from '../utils/logger.js';
import { success, error } from '../utils/response.js';

const {
  validateFile,
  getFileExtension,
  checkFileExists,
  saveFile,
  getFile,
  deleteFile: deleteFileUtil,
} = fileUtil;

const tag = 'services/file.ts';

// Upload file
export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
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

    validateFile(file);

    const fileExtension = getFileExtension(file.originalname);

    // Generate random 16-character filename
    const randomName = crypto.randomBytes(8).toString('hex'); // 16 chars
    const fileName = `${randomName}${fileExtension}`;

    await saveFile(randomName, fileExtension, file);

    const result = success<{ url: string; localUrl: string }>(
      {
        url: `${envVariables.PUBLIC_URL}/files/${fileName}`,
        localUrl: `${envVariables.LOCAL_URL}/files/${fileName}`,
      },
      'File uploaded successfully',
    );

    res.status(200).json(result);
  } catch (err) {
    logger.error(tag + ': uploadFile', err);
    res.status(400).json(error(err as Error));
  }
};

// Get file
export const fetchFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileName } = req.params as {
      fileName: string;
    };

    const filePath = getFile(fileName);

    if (!checkFileExists(fileName)) {
      res.status(404).json(
        error({
          name: 'notFound',
          message: 'File not found!',
        }),
      );
      return;
    }

    res.sendFile(path.resolve(filePath));
  } catch (err) {
    logger.error(tag + ': fetchFile', err);
    res.status(500).json(error(err as Error));
  }
};

// Delete file
export const deleteFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileName } = req.params as {
      fileName: string;
    };

    const isFileExists = checkFileExists(fileName);

    if (!isFileExists) {
      res.status(404).json(
        error({
          name: 'notFound',
          message: 'File not found!',
        }),
      );
      return;
    }

    await deleteFileUtil(fileName);

    res.status(200).json(success(null, 'File deleted successfully'));
  } catch (err) {
    logger.error(tag + ': deleteFile', err);
    res.status(500).json(error(err as Error));
  }
};
