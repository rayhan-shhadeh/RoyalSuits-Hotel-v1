import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';
import { config } from '../config';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Invalid request data',
      code: 'VALIDATION_ERROR',
      details: err.issues,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message, code: err.code });
    return;
  }

  const message = err instanceof Error ? err.message : 'An unexpected error occurred';
  logger.error({ err }, 'Unhandled error');

  res.status(500).json({
    error: config.NODE_ENV === 'production' ? 'Internal server error' : message,
    code: 'INTERNAL_ERROR',
  });
}
