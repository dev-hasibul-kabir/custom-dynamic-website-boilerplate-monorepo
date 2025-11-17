import express, { Router } from 'express';
import multer from 'multer';
import {
  uploadFile,
  fetchFile,
  listFiles,
  updateFile,
  deleteFile,
} from '../../services/file.js';
import { authMiddleware } from '../../middlewares/auth.js';

const router: Router = express.Router();

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

/**
 * @swagger
 * /v1/content/folders/{folderName}/files:
 *   get:
 *     summary: List all files in a folder
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: folderName
 *         required: true
 *         schema:
 *           type: string
 *         description: Folder name
 *     responses:
 *       200:
 *         description: List of files
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/v1/content/folders/:folderName/files',
  authMiddleware,
  listFiles,
);

/**
 * @swagger
 * /v1/content/files:
 *   post:
 *     summary: Upload a file
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               folderName:
 *                 type: string
 *               fileName:
 *                 type: string
 *               isConvertToWebp:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/v1/content/files',
  authMiddleware,
  upload.single('file'),
  uploadFile,
);

/**
 * @swagger
 * /v1/content/folders/{folderName}/files/{fileName}:
 *   get:
 *     summary: Download or view a file
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: folderName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: fileName
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: webp
 *         schema:
 *           type: boolean
 *         description: Convert to WebP format
 *     responses:
 *       200:
 *         description: File content
 *       404:
 *         description: File not found
 */
router.get('/v1/content/folders/:folderName/files/:fileName', fetchFile);

/**
 * @swagger
 * /v1/content/folders/{folderName}/files/{fileName}:
 *   put:
 *     summary: Update/replace a file
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: folderName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: fileName
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: File not found
 */
router.put(
  '/v1/content/folders/:folderName/files/:fileName',
  authMiddleware,
  upload.single('file'),
  updateFile,
);

/**
 * @swagger
 * /v1/content/folders/{folderName}/files/{fileName}:
 *   delete:
 *     summary: Delete a file
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: folderName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: fileName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: File not found
 */
router.delete(
  '/v1/content/folders/:folderName/files/:fileName',
  authMiddleware,
  deleteFile,
);

export default router;

