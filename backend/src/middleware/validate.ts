import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Invalid request data',
        code: 'VALIDATION_ERROR',
        details: result.error.issues,
      });
      return;
    }
    req.body = result.data as Record<string, unknown>;
    next();
  };
}
