import express, { Router, type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import envVariables from '../../utils/env.js';
import { authMiddleware } from '../../middlewares/auth.js';
import type { FolderInfo, FileInfo } from '../../types/index.js';

const router: Router = express.Router();

// Helper function to get folders data
const getFoldersData = (): FolderInfo[] => {
  try {
    const attachmentPath = envVariables.ATTACHMENT_FOLDER_PATH;
    if (!fs.existsSync(attachmentPath)) {
      fs.mkdirSync(attachmentPath, { recursive: true });
      return [];
    }
    const items = fs.readdirSync(attachmentPath);
    return items
      .filter((item) => {
        const itemPath = path.join(attachmentPath, item);
        return fs.statSync(itemPath).isDirectory();
      })
      .map((folder) => ({
        name: folder,
        path: `/folders/${folder}`,
        url: `${envVariables.PUBLIC_URL}/api/v1/content/folders/${folder}`,
      }));
  } catch {
    return [];
  }
};

// Helper function to get files in folder
const getFilesData = (folderName: string): FileInfo[] => {
  try {
    const folderPath = path.join(
      envVariables.ATTACHMENT_FOLDER_PATH,
      folderName,
    );
    if (!fs.existsSync(folderPath)) {
      return [];
    }
    const files = fs.readdirSync(folderPath).filter((item) => {
      const itemPath = path.join(folderPath, item);
      return fs.statSync(itemPath).isFile();
    });
    return files.map((file) => ({
      name: file,
      url: `${envVariables.PUBLIC_URL}/api/v1/content/folders/${folderName}/files/${file}`,
      localUrl: `${envVariables.LOCAL_URL}/api/v1/content/folders/${folderName}/files/${file}`,
    }));
  } catch {
    return [];
  }
};

// Home/Dashboard
router.get(
  '/',
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const folders = getFoldersData();
      res.render('home', {
        title: 'File Storage Dashboard',
        folders,
        hasToken: !!req.user,
      });
    } catch (err) {
      res.render('home', {
        title: 'File Storage Dashboard',
        folders: [],
        hasToken: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  },
);

// List all folders - requires auth
router.get(
  '/folders',
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const folders = getFoldersData();
      res.render('folders', {
        title: 'Folders',
        folders,
      });
    } catch (err) {
      res.render('folders', {
        title: 'Folders',
        folders: [],
        error:
          err instanceof Error
            ? err.message
            : 'Failed to load folders',
      });
    }
  },
);

// Folder detail with files - requires auth
router.get(
  '/folders/:folderName',
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { folderName } = req.params as { folderName: string };
      const folderPath = path.join(
        envVariables.ATTACHMENT_FOLDER_PATH,
        folderName,
      );

      if (!fs.existsSync(folderPath)) {
        res.render('folder-detail', {
          title: `Folder: ${folderName}`,
          folderName,
          folder: null,
          files: [],
          error: 'Folder not found',
        });
        return;
      }

      const files = getFilesData(folderName);

      res.render('folder-detail', {
        title: `Folder: ${folderName}`,
        folderName,
        folder: {
          name: folderName,
          files,
          fileCount: files.length,
        },
        files,
      });
    } catch (err) {
      res.render('folder-detail', {
        title: `Folder: ${req.params.folderName as string}`,
        folderName: req.params.folderName as string,
        folder: null,
        files: [],
        error:
          err instanceof Error
            ? err.message
            : 'Failed to load folder details',
      });
    }
  },
);

export default router;

