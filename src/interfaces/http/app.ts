import express from 'express';
import cors from 'cors';
import { applicationsRouter } from './routes/applications';
import { adminApplicationsRouter } from './routes/adminApplications';
import { registerRouter } from './routes/register';
import { referralsRouter } from './routes/referrals';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/applications', applicationsRouter);
  app.use('/admin/applications', adminApplicationsRouter);
  app.use('/', registerRouter);
  app.use('/', referralsRouter);

  // Global error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = err?.statusCode ?? 500;
    const message = err?.message ?? 'Internal Server Error';
    res.status(status).json({ error: message });
  });

  return app;
}


