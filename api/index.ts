import cors from 'cors';
import express from 'express';
import apiRoutes from '../server/routes/apiRoutes.ts';
import { errorHandler } from '../server/middleware/errorHandler.ts';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Mount API routes both under /api and root for Vercel Serverless Function compatibility
app.use('/api', apiRoutes);
app.use('/', apiRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', platform: 'SkillQuest', runtime: 'vercel-serverless' });
});

app.use(errorHandler);

export default app;
