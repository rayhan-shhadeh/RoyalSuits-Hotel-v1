import { NextFunction, Request, Response, Router } from 'express';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { availabilityRouter } from './availability';
import { bookingRouter } from './booking';

const router = Router();

router.get('/health', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    logger.error({ err }, 'Health check failed');
    next(err);
  }
});

router.use('/check-availability', availabilityRouter);
router.use('/', bookingRouter);

export { router };
