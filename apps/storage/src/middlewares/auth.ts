import type { Request, Response, NextFunction } from 'express';
import { verifyToken, validateTokenPayload } from '../utils/jwt.js';
import { error } from '../utils/response.js';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json(
        error({
          name: 'unauthorized',
          message: 'Authorization header is missing',
        }),
      );
      return;
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(401).json(
        error({
          name: 'unauthorized',
          message: 'Invalid or expired token',
        }),
      );
      return;
    }

    if (!validateTokenPayload(decoded)) {
      res.status(401).json(
        error({
          name: 'unauthorized',
          message: 'Invalid token payload',
        }),
      );
      return;
    }

    req.user = decoded;
    next();
  } catch {
    res.status(401).json(
      error({
        name: 'unauthorized',
        message: 'Authentication failed',
      }),
    );
  }
};

