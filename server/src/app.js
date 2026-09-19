import express from 'express';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
