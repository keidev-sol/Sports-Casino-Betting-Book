import crypto from 'crypto';
import { config } from '../config.js';

// Lightweight in-memory persistence. Swap for Postgres/Redis in production —
// every read/write goes through this module so the call sites won't change.
const users = new Map();
const bets = [];
const casinoBets = [];

function publicUser(u) {
  const { passwordHash, ...rest } = u;
  return rest;
}

export function createUser({ username }) {
  const id = crypto.randomUUID();
  const user = {
    id,
    username,
    balance: config.startingBalance,
    level: 1,
    xp: 0,
    rakeback: 0,
    createdAt: new Date().toISOString(),
  };
  users.set(id, user);
  return publicUser(user);
}

export function getUser(id) {
  const u = users.get(id);
  return u ? publicUser(u) : null;
}

export function getOrCreateDemoUser() {
  for (const u of users.values()) if (u.username === 'demo') return publicUser(u);
  const u = createUser({ username: 'demo' });
  return u;
}

export function adjustBalance(userId, delta, { reason } = {}) {
  const u = users.get(userId);
  if (!u) throw new Error('User not found');
  if (delta < 0 && u.balance + delta < 0) throw new Error('Insufficient balance');
  u.balance = Math.round((u.balance + delta) * 100) / 100;
  // XP: 1 xp per credit wagered; level every 1000 xp.
  if (delta < 0) {
    u.xp += Math.abs(delta);
    u.level = 1 + Math.floor(u.xp / 1000);
    u.rakeback = Math.round(u.xp * 0.001 * 100) / 100;
  }
  return publicUser(u);
}

export function recordSportsBet(bet) {
  bets.unshift(bet);
  if (bets.length > 500) bets.pop();
  return bet;
}

export function listSportsBets(userId) {
  return bets.filter((b) => b.userId === userId).slice(0, 50);
}

export function recordCasinoBet(bet) {
  casinoBets.unshift(bet);
  if (casinoBets.length > 200) casinoBets.pop();
  return bet;
}

// Feed of recent wins shown in the live ticker (anonymised-ish usernames).
export function recentActivity(limit = 25) {
  const merged = [
    ...casinoBets.map((b) => ({
      kind: 'casino',
      game: b.game,
      user: b.username,
      wager: b.wager,
      multiplier: b.multiplier,
      payout: b.payout,
      at: b.at,
    })),
    ...bets
      .filter((b) => b.status !== 'open')
      .map((b) => ({
        kind: 'sports',
        game: b.selectionLabel,
        user: b.username,
        wager: b.stake,
        multiplier: b.odds,
        payout: b.status === 'won' ? b.potentialReturn : 0,
        at: b.settledAt || b.placedAt,
      })),
  ]
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, limit);
  return merged;
}

export const _internal = { users, bets, casinoBets };
