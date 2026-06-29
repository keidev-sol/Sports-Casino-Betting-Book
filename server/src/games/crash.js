import { EventEmitter } from 'events';
import { newServerSeed, crashPoint } from '../services/provablyFair.js';
import { adjustBalance, recordCasinoBet } from '../services/store.js';

// "Rollercoaster" style crash game. A round cycles through:
//   betting (5s) → running (curve climbs) → crashed (3s) → repeat
export class CrashGame extends EventEmitter {
  constructor() {
    super();
    this.clientSeed = 'crow-public-seed';
    this.nonce = 0;
    this.state = 'betting';
    this.multiplier = 1.0;
    this.players = new Map(); // userId -> { username, wager, autoCashout, cashedAt }
    this.history = [];
    this.round = null;
    this._tick = null;
  }

  start() {
    this._beginBetting();
  }

  snapshot() {
    return {
      state: this.state,
      multiplier: Number(this.multiplier.toFixed(2)),
      roundId: this.round?.id,
      hash: this.round?.hash,
      players: [...this.players.values()].map((p) => ({
        username: p.username,
        wager: p.wager,
        cashedAt: p.cashedAt,
      })),
      history: this.history.slice(0, 20),
    };
  }

  _beginBetting() {
    this.nonce += 1;
    const { serverSeed, hash } = newServerSeed();
    this.round = {
      id: `crash-${this.nonce}`,
      serverSeed,
      hash,
      bustAt: crashPoint(serverSeed, this.clientSeed, this.nonce),
    };
    this.state = 'betting';
    this.multiplier = 1.0;
    this.players.clear();
    this.emit('state', this.snapshot());

    clearTimeout(this._tick);
    this._tick = setTimeout(() => this._beginRunning(), 5000);
  }

  _beginRunning() {
    this.state = 'running';
    this.emit('state', this.snapshot());
    const startedAt = Date.now();

    const loop = () => {
      const elapsed = (Date.now() - startedAt) / 1000;
      // Exponential growth curve.
      this.multiplier = Math.max(1, Number(Math.pow(1.0718, elapsed * 6).toFixed(2)));

      // Auto-cashouts
      for (const [userId, p] of this.players) {
        if (!p.cashedAt && p.autoCashout && this.multiplier >= p.autoCashout) {
          this._cashout(userId, p.autoCashout);
        }
      }

      if (this.multiplier >= this.round.bustAt) {
        return this._crash();
      }
      this.emit('tick', { multiplier: Number(this.multiplier.toFixed(2)) });
      this._tick = setTimeout(loop, 80);
    };
    loop();
  }

  _crash() {
    this.state = 'crashed';
    this.multiplier = this.round.bustAt;
    this.history.unshift({
      roundId: this.round.id,
      bust: Number(this.round.bustAt.toFixed(2)),
      serverSeed: this.round.serverSeed,
      hash: this.round.hash,
    });
    this.history = this.history.slice(0, 50);
    this.emit('state', { ...this.snapshot(), bust: Number(this.round.bustAt.toFixed(2)) });

    clearTimeout(this._tick);
    this._tick = setTimeout(() => this._beginBetting(), 3500);
  }

  placeBet(userId, username, wager, autoCashout) {
    if (this.state !== 'betting') throw new Error('Betting is closed for this round');
    if (this.players.has(userId)) throw new Error('Already placed a bet this round');
    adjustBalance(userId, -wager, { reason: 'crash-bet' });
    this.players.set(userId, { username, wager, autoCashout: autoCashout || null, cashedAt: null });
    this.emit('state', this.snapshot());
    return this.snapshot();
  }

  cashout(userId) {
    if (this.state !== 'running') throw new Error('Cannot cash out right now');
    return this._cashout(userId, this.multiplier);
  }

  _cashout(userId, at) {
    const p = this.players.get(userId);
    if (!p || p.cashedAt) throw new Error('No active bet to cash out');
    const multiplier = Number(at.toFixed(2));
    p.cashedAt = multiplier;
    const payout = Math.round(p.wager * multiplier * 100) / 100;
    const user = adjustBalance(userId, payout, { reason: 'crash-cashout' });
    recordCasinoBet({
      game: 'Crash',
      username: p.username,
      wager: p.wager,
      multiplier,
      payout,
      at: new Date().toISOString(),
    });
    this.emit('cashout', { username: p.username, multiplier, payout });
    return { multiplier, payout, balance: user.balance };
  }
}

export const crashGame = new CrashGame();
