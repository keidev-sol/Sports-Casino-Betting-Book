// Thin fetch wrapper that injects the demo JWT and unwraps JSON errors.
let token = localStorage.getItem('crow_token') || null;

export function setToken(t) {
  token = t;
  if (t) localStorage.setItem('crow_token', t);
  else localStorage.removeItem('crow_token');
}

export function getToken() {
  return token;
}

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  // Auth
  guest: (username) => request('/auth/guest', { method: 'POST', body: { username } }),
  me: () => request('/auth/me'),
  // Sports
  featured: () => request('/featured'),
  sports: () => request('/sports'),
  odds: (key) => request(`/sports/${key}/odds`),
  placeBet: (legs, stake) => request('/bets', { method: 'POST', body: { legs, stake } }),
  myBets: () => request('/bets'),
  // Casino
  casinoGames: () => request('/casino/games'),
  activity: () => request('/casino/activity'),
  dice: (wager, target, direction) =>
    request('/casino/dice', { method: 'POST', body: { wager, target, direction } }),
  // Bonus
  bonuses: () => request('/bonus'),
  claimBonus: (id) => request(`/bonus/${id}/claim`, { method: 'POST' }),
  // Realtime game actions
  crashBet: (wager, autoCashout) =>
    request('/games/crash/bet', { method: 'POST', body: { wager, autoCashout } }),
  crashCashout: () => request('/games/crash/cashout', { method: 'POST' }),
  rouletteBet: (color, amount) =>
    request('/games/roulette/bet', { method: 'POST', body: { color, amount } }),
  jackpotEnter: (amount) => request('/games/jackpot/enter', { method: 'POST', body: { amount } }),
};
