import type { Request, Response, NextFunction } from 'express';
import type { Schema } from 'joi';

export const validate =
  (schema: Schema) => (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    if (error) {
      res.status(400).json({
        statusCode: 400,
        message: error.details[0]?.message || 'Validation error',
      });
    } else {
      next();
    }
  };

