import { newServerSeed, hmacFloat } from '../services/provablyFair.js';
import { adjustBalance, recordCasinoBet } from '../services/store.js';
import type { DiceResult } from '../../../shared/types.js';

let nonce = 0;

export interface DiceParams {
  userId: string;
  username: string;
  wager: number;
  target: number;
  direction: 'over' | 'under';
}

// Instant provably-fair dice. Player picks a target (2-98) and rolls over/under.
export function rollDice({ userId, username, wager, target, direction }: DiceParams): DiceResult {
  if (wager <= 0) throw new Error('Invalid wager');
  if (target < 2 || target > 98) throw new Error('Target must be between 2 and 98');
  if (!['over', 'under'].includes(direction)) throw new Error('Invalid direction');

  adjustBalance(userId, -wager, { reason: 'dice-bet' });

  nonce += 1;
  const { serverSeed, hash } = newServerSeed();
  const roll = Math.round(hmacFloat(serverSeed, 'crow-dice', nonce) * 10000) / 100; // 0–100

  const winChance = direction === 'over' ? 100 - target : target;
  const multiplier = Math.round((99 / winChance) * 100) / 100; // 1% house edge
  const won = direction === 'over' ? roll > target : roll < target;

  let payout = 0;
  if (won) {
    payout = Math.round(wager * multiplier * 100) / 100;
    adjustBalance(userId, payout, { reason: 'dice-win' });
  }

  recordCasinoBet({
    game: 'Dice',
    username,
    wager,
    multiplier: won ? multiplier : 0,
    payout,
    at: new Date().toISOString(),
  });

  return { roll, target, direction, won, multiplier, payout, hash, serverSeed };
}
