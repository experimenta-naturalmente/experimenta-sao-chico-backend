import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import routes from './routes';
import { errorHandler, notFound } from './middlewares/errorHandler';

export function createApp() {
  const app = express();

  const allowAll = env.corsOrigins.includes('*');
  app.use(
    cors({
      origin: allowAll ? true : env.corsOrigins,
    }),
  );

  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use('/', routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
