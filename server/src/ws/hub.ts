import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import { crashGame } from '../games/crash.js';
import { rouletteGame } from '../games/roulette.js';
import { jackpotGame } from '../games/jackpot.js';
import { recentActivity } from '../services/store.js';
import type { WsChannel } from '../../../shared/types.js';

// Single multiplexed WS endpoint. Clients subscribe to channels and receive
// { channel, type, data } frames. Game engines emit; we fan-out to sockets.
export function attachWebSocket(server: Server): { broadcast: (channel: WsChannel, type: string, data: unknown) => void } {
  const wss = new WebSocketServer({ server, path: '/ws' });
  const channels = new Map<string, Set<WebSocket>>();

  function subscribe(ws: WebSocket, channel: string): void {
    if (!channels.has(channel)) channels.set(channel, new Set());
    channels.get(channel)!.add(ws);
  }

  function broadcast(channel: WsChannel, type: string, data: unknown): void {
    const subs = channels.get(channel);
    if (!subs) return;
    const frame = JSON.stringify({ channel, type, data });
    for (const ws of subs) if (ws.readyState === ws.OPEN) ws.send(frame);
  }

  wss.on('connection', (ws: WebSocket) => {
    ws.send(JSON.stringify({ channel: 'system', type: 'hello', data: { ts: Date.now() } }));

    ws.on('message', (raw) => {
      let msg: { type?: string; channel?: string };
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }
      if (msg.type === 'subscribe' && msg.channel) {
        subscribe(ws, msg.channel);
        // Send the current snapshot immediately on subscribe.
        if (msg.channel === 'crash') ws.send(JSON.stringify({ channel: 'crash', type: 'state', data: crashGame.snapshot() }));
        if (msg.channel === 'roulette') ws.send(JSON.stringify({ channel: 'roulette', type: 'state', data: rouletteGame.snapshot() }));
        if (msg.channel === 'jackpot') ws.send(JSON.stringify({ channel: 'jackpot', type: 'state', data: jackpotGame.snapshot() }));
        if (msg.channel === 'activity') ws.send(JSON.stringify({ channel: 'activity', type: 'feed', data: recentActivity() }));
      }
    });
  });

  // Wire game engine events → channels.
  crashGame.on('state', (d) => broadcast('crash', 'state', d));
  crashGame.on('tick', (d) => broadcast('crash', 'tick', d));
  crashGame.on('cashout', (d) => broadcast('crash', 'cashout', d));

  rouletteGame.on('state', (d) => broadcast('roulette', 'state', d));
  rouletteGame.on('win', (d) => broadcast('roulette', 'win', d));

  jackpotGame.on('state', (d) => broadcast('jackpot', 'state', d));

  // Push the live activity ticker every 3s.
  setInterval(() => broadcast('activity', 'feed', recentActivity()), 3000);

  return { broadcast };
}
