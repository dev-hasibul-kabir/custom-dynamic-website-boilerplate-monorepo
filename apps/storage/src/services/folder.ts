import fs from 'node:fs';
import path from 'node:path';
import slugify from 'slugify';
import type { Request, Response } from 'express';
import envVariables from '../utils/env.js';
import logger from '../utils/logger.js';
import { success, error } from '../utils/response.js';
import type { FolderInfo, FolderDetails, FileInfo } from '../types/index.js';

const tag = 'services/folder.ts';

// List all folders
export const listFolders = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const attachmentPath = envVariables.ATTACHMENT_FOLDER_PATH;

    if (!fs.existsSync(attachmentPath)) {
      fs.mkdirSync(attachmentPath, { recursive: true });
      res.status(200).json(success<FolderInfo[]>([], 'No folders found'));
      return;
    }

    const items = fs.readdirSync(attachmentPath);
    const folders = items.filter((item) => {
      const itemPath = path.join(attachmentPath, item);
      return fs.statSync(itemPath).isDirectory();
    });

    const folderList: FolderInfo[] = folders.map((folder) => ({
      name: folder,
      path: `/api/v1/content/folders/${folder}`,
      url: `${envVariables.PUBLIC_URL}/api/v1/content/folders/${folder}`,
    }));

    res.status(200).json(success(folderList, 'Folders retrieved successfully'));
  } catch (err) {
    logger.error(tag + ': listFolders', err);
    res.status(500).json(error(err as Error));
  }
};

// Create folder
export const createFolder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { folderName } = req.body as { folderName?: string };

    if (!folderName || !folderName.trim()) {
      res.status(400).json(
        error({
          name: 'badRequest',
          message: 'Folder name is required!',
        }),
      );
      return;
    }

    const sanitizedFolderName = slugify(folderName.trim(), {
      strict: true,
    });

    const folderPath = path.join(
      envVariables.ATTACHMENT_FOLDER_PATH,
      sanitizedFolderName,
    );

    if (fs.existsSync(folderPath)) {
      res.status(409).json(
        error({
          name: 'badRequest',
          message: 'Folder already exists!',
        }),
      );
      return;
    }

    fs.mkdirSync(folderPath, { recursive: true });

    res.status(201).json(
      success<FolderInfo>(
        {
          name: sanitizedFolderName,
          path: `/api/v1/content/folders/${sanitizedFolderName}`,
          url: `${envVariables.PUBLIC_URL}/api/v1/content/folders/${sanitizedFolderName}`,
        },
        'Folder created successfully',
      ),
    );
  } catch (err) {
    logger.error(tag + ': createFolder', err);
    res.status(500).json(error(err as Error));
  }
};

// Update folder (rename)
export const updateFolder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { folderName: oldFolderName } = req.params as {
      folderName: string;
    };
    const { folderName: newFolderName } = req.body as {
      folderName?: string;
    };

    if (!newFolderName || !newFolderName.trim()) {
      res.status(400).json(
        error({
          name: 'badRequest',
          message: 'New folder name is required!',
        }),
      );
      return;
    }

    const oldPath = path.join(
      envVariables.ATTACHMENT_FOLDER_PATH,
      oldFolderName,
    );
    const sanitizedNewFolderName = slugify(newFolderName.trim(), {
      strict: true,
    });
    const newPath = path.join(
      envVariables.ATTACHMENT_FOLDER_PATH,
      sanitizedNewFolderName,
    );

    if (!fs.existsSync(oldPath)) {
      res.status(404).json(
        error({
          name: 'notFound',
          message: 'Folder not found!',
        }),
      );
      return;
    }

    if (fs.existsSync(newPath)) {
      res.status(409).json(
        error({
          name: 'badRequest',
          message: 'A folder with the new name already exists!',
        }),
      );
      return;
    }

    fs.renameSync(oldPath, newPath);

    res.status(200).json(
      success<FolderInfo>(
        {
          name: sanitizedNewFolderName,
          path: `/api/v1/content/folders/${sanitizedNewFolderName}`,
          url: `${envVariables.PUBLIC_URL}/api/v1/content/folders/${sanitizedNewFolderName}`,
        },
        'Folder renamed successfully',
      ),
    );
  } catch (err) {
    logger.error(tag + ': updateFolder', err);
    res.status(500).json(error(err as Error));
  }
};

// Delete folder
export const deleteFolder = async (
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

    // Check if folder is empty
    const files = fs.readdirSync(folderPath);
    if (files.length > 0) {
      res.status(400).json(
        error({
          name: 'badRequest',
          message: 'Cannot delete folder. Folder is not empty!',
        }),
      );
      return;
    }

    fs.rmSync(folderPath, { recursive: true });

    res.status(200).json(success(null, 'Folder deleted successfully'));
  } catch (err) {
    logger.error(tag + ': deleteFolder', err);
    res.status(500).json(error(err as Error));
  }
};

// Get folder details with files
export const getFolderDetails = async (
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

    const files = fs.readdirSync(folderPath).filter((item) => {
      const itemPath = path.join(folderPath, item);
      return fs.statSync(itemPath).isFile();
    });

    const fileList: FileInfo[] = files.map((file) => ({
      name: file,
      url: `${envVariables.PUBLIC_URL}/api/v1/content/folders/${folderName}/files/${file}`,
      localUrl: `${envVariables.LOCAL_URL}/api/v1/content/folders/${folderName}/files/${file}`,
    }));

    res.status(200).json(
      success<FolderDetails>(
        {
          name: folderName,
          files: fileList,
          fileCount: fileList.length,
        },
        'Folder details retrieved successfully',
      ),
    );
  } catch (err) {
    logger.error(tag + ': getFolderDetails', err);
    res.status(500).json(error(err as Error));
  }
};

