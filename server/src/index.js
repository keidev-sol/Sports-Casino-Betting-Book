import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import authRoutes from './routes/auth.js';
import sportsRoutes from './routes/sports.js';
import casinoRoutes from './routes/casino.js';
import bonusRoutes from './routes/bonus.js';
import gameRoutes from './routes/games.js';

import { attachWebSocket } from './ws/hub.js';
import { crashGame } from './games/crash.js';
import { rouletteGame } from './games/roulette.js';
import { jackpotGame } from './games/jackpot.js';

const app = express();
app.use(cors());
app.use(express.json());
if (config.nodeEnv !== 'test') app.use(morgan('dev'));

app.get('/api/health', (_req, res) =>
  res.json({ ok: true, mode: config.mockMode ? 'mock' : 'live', ts: Date.now() })
);

app.use('/api/auth', authRoutes);
app.use('/api', sportsRoutes);
app.use('/api/casino', casinoRoutes);
app.use('/api/bonus', bonusRoutes);
app.use('/api/games', gameRoutes);

// In production, serve the built client (client/dist) from the same origin so
// the whole app runs on a single port. Run `npm run build` first to create it.
const clientDist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // SPA fallback: any non-API route returns index.html for client-side routing.
  app.get(/^\/(?!api|ws).*/, (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
} else {
  app.get('/', (_req, res) =>
    res.type('html').send('<h1>Crow API</h1><p>Run <code>npm run build</code> then reload, or use <code>npm run dev</code> for the dev client on :5173.</p>')
  );
}

// Centralised error handler.
app.use((err, _req, res, _next) => {
  console.error('[error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

const server = http.createServer(app);
attachWebSocket(server);

// Boot the realtime game loops.
crashGame.start();
rouletteGame.start();
jackpotGame.start();

server.listen(config.port, () => {
  console.log(`\n  ⚡ Crow server on http://localhost:${config.port}`);
  console.log(`  📡 Mode: ${config.mockMode ? 'MOCK (no ODDS_API_KEY set)' : 'LIVE Odds API'}`);
  console.log(`  🔌 WebSocket: ws://localhost:${config.port}/ws`);
  console.log(`  🗂️  Client: ${fs.existsSync(clientDist) ? 'serving client/dist (production)' : 'not built — use npm run dev or npm run build'}\n`);
});
