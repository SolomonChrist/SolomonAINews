import express, { Request, Response } from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { initializeDatabase } from './db/database.js';
import { newsRouter } from './routes/news.js';
import { sourcesRouter } from './routes/sources.js';
import { twitterRouter } from './routes/twitter.js';
import { videosRouter } from './routes/videos.js';
import { settingsRouter } from './routes/settings.js';
import { setupWebSocketServer } from './websocket/handler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();

const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
await initializeDatabase();

// API Routes
app.use('/api/news', newsRouter);
app.use('/api/sources', sourcesRouter);
app.use('/api/twitter', twitterRouter);
app.use('/api/videos', videosRouter);
app.use('/api/settings', settingsRouter);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files (React frontend)
app.use(express.static(path.join(__dirname, '../public')));

// SPA fallback
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// WebSocket setup
setupWebSocketServer(wss);

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 AI Newsbot Dashboard running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server ready for real-time updates`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
