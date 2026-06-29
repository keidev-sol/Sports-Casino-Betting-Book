// Minimal reconnecting WebSocket with channel subscriptions.
const listeners = new Map(); // channel -> Set<fn>
let socket = null;
let subscribed = new Set();
let reconnectTimer = null;

function connect() {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  socket = new WebSocket(`${proto}://${location.host}/ws`);

  socket.onopen = () => {
    subscribed.forEach((ch) => socket.send(JSON.stringify({ type: 'subscribe', channel: ch })));
  };
  socket.onmessage = (e) => {
    let frame;
    try {
      frame = JSON.parse(e.data);
    } catch {
      return;
    }
    const subs = listeners.get(frame.channel);
    if (subs) subs.forEach((fn) => fn(frame));
  };
  socket.onclose = () => {
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(connect, 1500);
  };
  socket.onerror = () => socket?.close();
}

export function subscribe(channel, fn) {
  if (!socket) connect();
  if (!listeners.has(channel)) listeners.set(channel, new Set());
  listeners.get(channel).add(fn);

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
