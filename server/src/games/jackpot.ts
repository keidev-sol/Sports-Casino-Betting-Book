import { EventEmitter } from 'events';
import { newServerSeed, hmacFloat } from '../services/provablyFair.js';
import { adjustBalance, recordCasinoBet } from '../services/store.js';
import type { JackpotSnapshot } from '../../../shared/types.js';

interface JackpotEntryInternal {
  userId: string;
  username: string;
  amount: number;
}

interface JackpotRound {
  id: string;
  serverSeed: string;
  hash: string;
  state: JackpotSnapshot['state'];
  entries: JackpotEntryInternal[];
  endsAt: number | null;
  winner: JackpotSnapshot['winner'];
}

type JackpotHistory = JackpotSnapshot['history'][number];

// Community jackpot: players buy tickets into a shared pot. When the timer
// expires a winner is drawn with probability proportional to their stake.
// House takes a 5% rake.
export class JackpotGame extends EventEmitter {
  clientSeed = 'crow-jackpot';
  nonce = 0;
  rake = 0.05;
  round!: JackpotRound;
  history: JackpotHistory[] = [];
  private _tick: ReturnType<typeof setTimeout> | null = null;

  start(): void {
    this._open();
  }

  snapshot(): JackpotSnapshot {
    const pot = this.round.entries.reduce((s, e) => s + e.amount, 0);
    return {
      roundId: this.round.id,
      state: this.round.state,
      hash: this.round.hash,
      pot: Math.round(pot * 100) / 100,
      entries: this.round.entries.map((e) => ({
        username: e.username,
        amount: e.amount,
        chance: pot ? Math.round((e.amount / pot) * 1000) / 10 : 0,
      })),
      endsAt: this.round.endsAt,
      winner: this.round.winner,
      history: this.history.slice(0, 10),
    };
  }

  private _open(): void {
    this.nonce += 1;
    const { serverSeed, hash } = newServerSeed();
    this.round = {
      id: `jackpot-${this.nonce}`,
      serverSeed,
      hash,
      state: 'open',
      entries: [],
      endsAt: null,
      winner: null,
    };
    this.emit('state', this.snapshot());
  }

  enter(userId: string, username: string, amount: number): JackpotSnapshot {
    if (this.round.state !== 'open' && this.round.state !== 'counting') {
      throw new Error('Jackpot is drawing, please wait');
    }
    if (amount <= 0) throw new Error('Invalid amount');
    adjustBalance(userId, -amount, { reason: 'jackpot-entry' });

    const existing = this.round.entries.find((e) => e.userId === userId);
    if (existing) existing.amount += amount;
    else this.round.entries.push({ userId, username, amount });

    // First entry starts a 30s countdown; second player shortens it to 20s.
    if (!this.round.endsAt) {
      this.round.state = 'counting';
      this.round.endsAt = Date.now() + 30000;
      if (this._tick) clearTimeout(this._tick);
      this._tick = setTimeout(() => this._draw(), 30000);
    }
    this.emit('state', this.snapshot());
    return this.snapshot();
  }

  private _draw(): void {
    this.round.state = 'drawing';
    const entries = this.round.entries;
    const pot = entries.reduce((s, e) => s + e.amount, 0);
    const roll = hmacFloat(this.round.serverSeed, this.clientSeed, this.nonce);
    let target = roll * pot;
    let winner = entries[entries.length - 1];
    for (const e of entries) {
      target -= e.amount;
      if (target <= 0) {
        winner = e;
        break;
      }
    }
    const prize = Math.round(pot * (1 - this.rake) * 100) / 100;
    this.round.winner = { username: winner.username, prize, chance: Math.round((winner.amount / pot) * 1000) / 10 };
    adjustBalance(winner.userId, prize, { reason: 'jackpot-win' });
    recordCasinoBet({
      game: 'Jackpot',
      username: winner.username,
      wager: winner.amount,
      multiplier: Math.round((prize / winner.amount) * 100) / 100,
      payout: prize,
      at: new Date().toISOString(),
    });
    this.history.unshift({
      roundId: this.round.id,
      winner: winner.username,
      prize,
      pot: Math.round(pot * 100) / 100,
      serverSeed: this.round.serverSeed,
    });
    this.emit('state', this.snapshot());
    if (this._tick) clearTimeout(this._tick);
    this._tick = setTimeout(() => this._open(), 6000);
  }
}

export const jackpotGame = new JackpotGame();
