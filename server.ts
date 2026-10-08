import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import apiRoutes from './server/routes/apiRoutes.ts';
import { errorHandler } from './server/middleware/errorHandler.ts';
import { initializeSupabaseDatabase } from './server/supabase.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, 'server', '.env') });
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  // Initialize Supabase connection, Cloud Storage backup, and PostgreSQL table seeding
  initializeSupabaseDatabase().catch((err) => {
    console.error('[Supabase Init]:', err);
  });

  // Mount REST API routes
  app.use('/api', apiRoutes);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', platform: 'SkillQuest' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SkillQuest server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
