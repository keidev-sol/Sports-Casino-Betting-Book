import { EventEmitter } from 'events';
import { newServerSeed, rouletteRoll } from '../services/provablyFair.js';
import { adjustBalance, recordCasinoBet } from '../services/store.js';
import type { RouletteSnapshot, RouletteSlot } from '../../../shared/types.js';

// X-Roulette: a 15-slot wheel. Slot 0 is the green "x14" jackpot; the rest
// alternate black (x2) and red (x2). Bets: red / black / green.
const SLOTS: RouletteSlot[] = Array.from({ length: 15 }, (_, i) => {
  if (i === 0) return { n: 0, color: 'green' as const, payout: 14 };
  return { n: i, color: (i % 2 === 1 ? 'red' : 'black') as 'red' | 'black', payout: 2 };
});

const PAYOUTS: Record<string, number> = { red: 2, black: 2, green: 14 };

interface RouletteBet {
  userId: string;
  username: string;
  color: string;
  amount: number;
}

interface RouletteRound {
  id: string;
  serverSeed: string;
  hash: string;
  result: RouletteSlot | null;
  endsAt: number;
}

type RouletteHistory = RouletteSlot & { roundId: string; serverSeed: string };

export class RouletteGame extends EventEmitter {
  clientSeed = 'crow-roulette';
  nonce = 0;
  state: RouletteSnapshot['state'] = 'betting';
  bets: RouletteBet[] = [];
  history: RouletteHistory[] = [];
  round: RouletteRound | null = null;
  private _tick: ReturnType<typeof setTimeout> | null = null;

  start(): void {
    this._beginBetting();
  }

  snapshot(): RouletteSnapshot {
    return {
      state: this.state,
      roundId: this.round?.id,
      hash: this.round?.hash,
      slots: SLOTS,
      bets: this.bets.map((b) => ({ username: b.username, color: b.color, amount: b.amount })),
      result: this.round?.result ?? null,
      history: this.history.slice(0, 20),
      endsAt: this.round?.endsAt ?? null,
    };
  }

  private _beginBetting(): void {
    this.nonce += 1;
    const { serverSeed, hash } = newServerSeed();
    this.round = {
      id: `roul-${this.nonce}`,
      serverSeed,
      hash,
      result: null,
      endsAt: Date.now() + 12000,
    };
    this.state = 'betting';
    this.bets = [];
    this.emit('state', this.snapshot());
    if (this._tick) clearTimeout(this._tick);
    this._tick = setTimeout(() => this._spin(), 12000);
  }

  private _spin(): void {
    if (!this.round) return;
    this.state = 'spinning';
    const slotIndex = rouletteRoll(this.round.serverSeed, this.clientSeed, this.nonce);
    const slot = SLOTS[slotIndex];
    this.round.result = slot;
    this.emit('state', this.snapshot());

    // Settle after the wheel animation (~4s).
    if (this._tick) clearTimeout(this._tick);
    this._tick = setTimeout(() => this._settle(slot), 4500);
  }

  private _settle(slot: RouletteSlot): void {
    if (!this.round) return;
    for (const bet of this.bets) {
      if (bet.color === slot.color) {
        const payout = Math.round(bet.amount * PAYOUTS[slot.color] * 100) / 100;
        adjustBalance(bet.userId, payout, { reason: 'roulette-win' });
        recordCasinoBet({
          game: 'Roulette',
          username: bet.username,
          wager: bet.amount,
          multiplier: PAYOUTS[slot.color],
          payout,
          at: new Date().toISOString(),
        });
        this.emit('win', { username: bet.username, color: slot.color, payout });
      }
    }
    this.history.unshift({ ...slot, roundId: this.round.id, serverSeed: this.round.serverSeed });
    this.history = this.history.slice(0, 50);
    this.state = 'ended';
    this.emit('state', this.snapshot());
    if (this._tick) clearTimeout(this._tick);
    this._tick = setTimeout(() => this._beginBetting(), 2500);
  }

  placeBet(userId: string, username: string, color: string, amount: number): RouletteSnapshot {
    if (this.state !== 'betting') throw new Error('Betting is closed');
    if (!PAYOUTS[color]) throw new Error('Invalid colour');
    if (amount <= 0) throw new Error('Invalid amount');
    adjustBalance(userId, -amount, { reason: 'roulette-bet' });
    this.bets.push({ userId, username, color, amount });
    this.emit('state', this.snapshot());
    return this.snapshot();
  }
}

export const rouletteGame = new RouletteGame();
