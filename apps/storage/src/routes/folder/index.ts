import express, { Router } from 'express';
import {
  listFolders,
  createFolder,
  updateFolder,
  deleteFolder,
  getFolderDetails,
} from '../../services/folder.js';
import { authMiddleware } from '../../middlewares/auth.js';

const router: Router = express.Router();

/**
 * @swagger
 * /v1/content/folders:
 *   get:
 *     summary: List all folders
 *     tags: [Folders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of folders
 *       401:
 *         description: Unauthorized
 */
router.get('/v1/content/folders', authMiddleware, listFolders);

/**
 * @swagger
 * /v1/content/folders/{folderName}:
 *   get:
 *     summary: Get folder details with files
 *     tags: [Folders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: folderName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Folder details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Folder not found
 */
router.get('/v1/content/folders/:folderName', authMiddleware, getFolderDetails);

/**
 * @swagger
 * /v1/content/folders:
 *   post:
 *     summary: Create a new folder
 *     tags: [Folders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - folderName
 *             properties:
 *               folderName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Folder created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Folder already exists
 */
router.post('/v1/content/folders', authMiddleware, createFolder);

/**
 * @swagger
 * /v1/content/folders/{folderName}:
 *   put:
 *     summary: Rename a folder
 *     tags: [Folders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: folderName
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - folderName
 *             properties:
 *               folderName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Folder renamed successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Folder not found
 *       409:
 *         description: New folder name already exists
 */
router.put('/v1/content/folders/:folderName', authMiddleware, updateFolder);

/**
 * @swagger
 * /v1/content/folders/{folderName}:
 *   delete:
 *     summary: Delete a folder
 *     tags: [Folders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: folderName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Folder deleted successfully
 *       400:
 *         description: Folder is not empty
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Folder not found
 */
router.delete('/v1/content/folders/:folderName', authMiddleware, deleteFolder);

export default router;

