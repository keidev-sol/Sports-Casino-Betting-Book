import crypto from 'crypto';
import { adjustBalance, recordSportsBet, listSportsBets } from './store.js';

// Places a sports bet against odds the client selected. We re-validate the
// stake and compute the potential return server-side (never trust the client).
export function placeSportsBet({ user, legs, stake }) {
  if (!Array.isArray(legs) || legs.length === 0) throw new Error('Empty bet slip');
  if (stake <= 0) throw new Error('Invalid stake');

  // Parlay: multiply all leg odds together.
  const combinedOdds = legs.reduce((acc, l) => acc * Number(l.price), 1);
  const potentialReturn = Math.round(stake * combinedOdds * 100) / 100;

  adjustBalance(user.id, -stake, { reason: 'sports-bet' });

  const bet = {
    id: crypto.randomUUID(),
    userId: user.id,
    username: user.username,
    legs,
    stake,
    odds: Math.round(combinedOdds * 100) / 100,
    potentialReturn,
    selectionLabel: legs.length > 1 ? `${legs.length}-leg parlay` : legs[0].label,
    status: 'open',
    placedAt: new Date().toISOString(),
    settledAt: null,
  };
  recordSportsBet(bet);

  // Demo auto-settlement: resolve the bet after a short delay with a
  // probability implied by the odds (longer odds → lower win chance).
  const winProb = Math.min(0.92, 1 / bet.odds);
  setTimeout(() => {
    const won = Math.random() < winProb;
    bet.status = won ? 'won' : 'lost';
    bet.settledAt = new Date().toISOString();
    if (won) adjustBalance(user.id, potentialReturn, { reason: 'sports-win' });
  }, 8000 + Math.random() * 8000);

  return bet;
}

export function getMyBets(userId) {
  return listSportsBets(userId);
}
