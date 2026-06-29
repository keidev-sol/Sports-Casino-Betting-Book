import type {
  User,
  AuthResponse,
  Sport,
  OddsEvent,
  Quota,
  FeaturedGroup,
  SportsBet,
  BetLeg,
  CasinoGame,
  CasinoCategory,
  ActivityItem,
  Bonus,
  DiceResult,
  CrashSnapshot,
  RouletteSnapshot,
  JackpotSnapshot,
} from '@shared/types';

// Thin fetch wrapper that injects the demo JWT and unwraps JSON errors.
let token: string | null = localStorage.getItem('crow_token');

export function setToken(t: string | null): void {
  token = t;
  if (t) localStorage.setItem('crow_token', t);
  else localStorage.removeItem('crow_token');
}

export function getToken(): string | null {
  return token;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
}

async function request<T>(path: string, { method = 'GET', body }: RequestOptions = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  return data as T;
}

export const api = {
  // Auth
  guest: (username?: string) => request<AuthResponse>('/auth/guest', { method: 'POST', body: { username } }),
  me: () => request<{ user: User }>('/auth/me'),
  // Sports
  featured: () => request<{ feed: FeaturedGroup[]; quota: Quota }>('/featured'),
  sports: () => request<{ sports: Sport[]; quota: Quota }>('/sports'),
  odds: (key: string) => request<{ events: OddsEvent[] }>(`/sports/${key}/odds`),
  placeBet: (legs: BetLeg[], stake: number) => request<{ bet: SportsBet }>('/bets', { method: 'POST', body: { legs, stake } }),
  myBets: () => request<{ bets: SportsBet[] }>('/bets'),
  // Casino
  casinoGames: () => request<{ games: CasinoGame[]; categories: CasinoCategory[] }>('/casino/games'),
  activity: () => request<{ activity: ActivityItem[] }>('/casino/activity'),
  dice: (wager: number, target: number, direction: 'over' | 'under') =>
    request<{ result: DiceResult }>('/casino/dice', { method: 'POST', body: { wager, target, direction } }),
  // Bonus
  bonuses: () => request<{ bonuses: Bonus[] }>('/bonus'),
  claimBonus: (id: string) => request<{ bonus: Bonus; reward: number; balance: number }>(`/bonus/${id}/claim`, { method: 'POST' }),
  // Realtime game actions
  crashBet: (wager: number, autoCashout: number | null) =>
    request<CrashSnapshot>('/games/crash/bet', { method: 'POST', body: { wager, autoCashout } }),
  crashCashout: () => request<{ multiplier: number; payout: number; balance: number }>('/games/crash/cashout', { method: 'POST' }),
  rouletteBet: (color: string, amount: number) =>
    request<RouletteSnapshot>('/games/roulette/bet', { method: 'POST', body: { color, amount } }),
  jackpotEnter: (amount: number) => request<JackpotSnapshot>('/games/jackpot/enter', { method: 'POST', body: { amount } }),
};
