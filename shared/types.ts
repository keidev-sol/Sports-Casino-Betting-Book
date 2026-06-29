// ──────────────────────────────────────────────────────────────
//  Crow — Shared types
//  Imported by both the server and the client so REST/WS payloads
//  are type-checked end-to-end.
// ──────────────────────────────────────────────────────────────

/* ===== The Odds API shapes ===== */
export interface Outcome {
  name: string;
  price: number;
  point?: number;
}

export interface Market {
  key: 'h2h' | 'spreads' | 'totals' | string;
  last_update?: string;
  outcomes: Outcome[];
}

export interface Bookmaker {
  key: string;
  title: string;
  last_update?: string;
  markets: Market[];
}

export interface OddsEvent {
  id: string;
  sport_key: string;
  sport_title?: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
}

export interface Sport {
  key: string;
  group: string;
  title: string;
  description: string;
  active: boolean;
  has_outrights: boolean;
}

export interface Quota {
  remaining: number | null;
  used: number | null;
  mockMode: boolean;
}

export interface FeaturedGroup {
  sportKey: string;
  events: OddsEvent[];
}

/* ===== Users & auth ===== */
export interface User {
  id: string;
  username: string;
  balance: number;
  level: number;
  xp: number;
  rakeback: number;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

/* ===== Sports betting ===== */
export interface BetLeg {
  eventId: string;
  label: string;
  price: number;
  market: string;
}

export type BetStatus = 'open' | 'won' | 'lost';

export interface SportsBet {
  id: string;
  userId: string;
  username: string;
  legs: BetLeg[];
  stake: number;
  odds: number;
  potentialReturn: number;
  selectionLabel: string;
  status: BetStatus;
  placedAt: string;
  settledAt: string | null;
}

/* ===== Casino lobby ===== */
export interface CasinoGame {
  id: string;
  name: string;
  provider: string;
  category: 'originals' | 'slots' | 'live' | 'table' | string;
  rtp: number;
  route?: string;
  external?: boolean;
  accent: string;
  tag?: string;
}

export interface CasinoCategory {
  id: string;
  label: string;
}

export interface ActivityItem {
  kind: 'casino' | 'sports';
  game: string;
  user: string;
  wager: number;
  multiplier: number;
  payout: number;
  at: string;
}

/* ===== Bonuses ===== */
export interface Bonus {
  id: string;
  title: string;
  desc: string;
  reward: number;
  type: 'deposit' | 'recurring' | 'daily' | 'weekly' | 'race' | string;
  cta: string;
  claimed?: boolean;
  available?: boolean;
  rakebackBalance?: number;
}

/* ===== Provably-fair games ===== */
export interface CrashPlayer {
  username: string;
  wager: number;
  cashedAt: number | null;
}

export interface CrashHistory {
  roundId: string;
  bust: number;
  serverSeed: string;
  hash: string;
}

export interface CrashSnapshot {
  state: 'betting' | 'running' | 'crashed';
  multiplier: number;
  roundId?: string;
  hash?: string;
  players: CrashPlayer[];
  history: CrashHistory[];
  bust?: number;
}

export interface RouletteSlot {
  n: number;
  color: 'red' | 'black' | 'green';
  payout: number;
}

export interface RouletteSnapshot {
  state: 'betting' | 'spinning' | 'ended';
  roundId?: string;
  hash?: string;
  slots: RouletteSlot[];
  bets: { username: string; color: string; amount: number }[];
  result: RouletteSlot | null;
  history: (RouletteSlot & { roundId: string; serverSeed: string })[];
  endsAt: number | null;
}

export interface JackpotEntry {
  username: string;
  amount: number;
  chance: number;
}

export interface JackpotSnapshot {
  roundId: string;
  state: 'open' | 'counting' | 'drawing';
  hash: string;
  pot: number;
  entries: JackpotEntry[];
  endsAt: number | null;
  winner: { username: string; prize: number; chance: number } | null;
  history: { roundId: string; winner: string; prize: number; pot: number; serverSeed: string }[];
}

export interface DiceResult {
  roll: number;
  target: number;
  direction: 'over' | 'under';
  won: boolean;
  multiplier: number;
  payout: number;
  hash: string;
  serverSeed: string;
}

/* ===== WebSocket protocol ===== */
export type WsChannel = 'crash' | 'roulette' | 'jackpot' | 'activity' | 'system';

export interface WsFrame<T = unknown> {
  channel: WsChannel;
  type: string;
  data: T;
}
