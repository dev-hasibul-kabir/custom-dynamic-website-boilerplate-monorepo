import { Router, type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import envVariables from '../utils/env.js';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Public endpoint to check server status and connectivity
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 *                 environment:
 *                   type: string
 *                 attachments:
 *                   type: object
 *                   properties:
 *                     directory:
 *                       type: string
 *                     exists:
 *                       type: boolean
 *                     writable:
 *                       type: boolean
 */
router.get('/health', (_req: Request, res: Response) => {
  const startTime = process.uptime();
  const attachmentsPath = envVariables.ATTACHMENT_FOLDER_PATH;

  let attachmentsStatus = {
    directory: attachmentsPath,
    exists: false,
    writable: false,
  };

  try {
    const stats = fs.statSync(attachmentsPath);
    attachmentsStatus.exists = stats.isDirectory();
    attachmentsStatus.writable = fs.accessSync(attachmentsPath, fs.constants.W_OK) === undefined;
  } catch {
    // Directory doesn't exist or not accessible
  }

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(startTime),
    environment: envVariables.ENV,
    attachments: attachmentsStatus,
  });
});

export default router;

