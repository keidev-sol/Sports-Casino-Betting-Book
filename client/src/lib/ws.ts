import type { WsFrame } from '@shared/types';

// Minimal reconnecting WebSocket with channel subscriptions.
type Listener = (frame: WsFrame) => void;

const listeners = new Map<string, Set<Listener>>();
let socket: WebSocket | null = null;
const subscribed = new Set<string>();
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

function connect(): void {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  socket = new WebSocket(`${proto}://${location.host}/ws`);

  socket.onopen = () => {
    subscribed.forEach((ch) => socket?.send(JSON.stringify({ type: 'subscribe', channel: ch })));
  };
  socket.onmessage = (e: MessageEvent) => {
    let frame: WsFrame;
    try {
      frame = JSON.parse(e.data);
    } catch {
      return;
    }
    const subs = listeners.get(frame.channel);
    if (subs) subs.forEach((fn) => fn(frame));
  };
  socket.onclose = () => {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(connect, 1500);
  };
  socket.onerror = () => socket?.close();
}

export function subscribe(channel: string, fn: Listener): () => void {
  if (!socket) connect();
  if (!listeners.has(channel)) listeners.set(channel, new Set());
  listeners.get(channel)!.add(fn);

  if (!subscribed.has(channel)) {
    subscribed.add(channel);
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'subscribe', channel }));
    }
  }
  return () => {
    listeners.get(channel)?.delete(fn);
  };
}
