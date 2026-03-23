import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { router } from './routes/index';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import { logger } from './lib/logger';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.ALLOWED_ORIGIN,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: false,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(generalLimiter);

app.use('/api', router);

app.use(errorHandler as express.ErrorRequestHandler);

app.listen(config.PORT, () => {
  logger.info({ port: config.PORT, env: config.NODE_ENV }, 'RoyalSuits Hotel API started');
});

export { app };
