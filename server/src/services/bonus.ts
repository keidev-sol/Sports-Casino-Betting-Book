import { adjustBalance, getUser } from './store.js';
import type { Bonus } from '../../../shared/types.js';

// Tracks which bonuses a user has claimed (in-memory).
const claimed = new Map<string, Set<string>>(); // userId -> Set(bonusId)

export const BONUSES: Bonus[] = [
  { id: 'welcome', title: 'Welcome Bonus', desc: '100% match up to 5,000 credits on your first deposit.', reward: 5000, type: 'deposit', cta: 'Claim' },
  { id: 'rakeback', title: 'Instant Rakeback', desc: 'Earn up to 10% rakeback on every wager, credited live.', reward: 0, type: 'recurring', cta: 'Active' },
  { id: 'daily', title: 'Daily Free Spin', desc: 'Spin the wheel every 24h for up to 1,000 credits.', reward: 1000, type: 'daily', cta: 'Spin' },
  { id: 'weekly', title: 'Weekly Cashback', desc: 'Get 10% of net losses back every Monday.', reward: 2500, type: 'weekly', cta: 'Claim' },
  { id: 'leaderboard', title: 'Wager Race', desc: '50,000 credit prize pool split among the top 50 wagerers.', reward: 0, type: 'race', cta: 'View' },
];

export function listBonuses(userId: string): Bonus[] {
  const set = claimed.get(userId) || new Set<string>();
  const user = getUser(userId);
  return BONUSES.map((b) => ({
    ...b,
    claimed: set.has(b.id),
    available: b.id === 'rakeback' ? true : !set.has(b.id),
    rakebackBalance: b.id === 'rakeback' ? user?.rakeback ?? 0 : undefined,
  }));
}

export interface ClaimResult {
  bonus: Bonus;
  reward: number;
  balance: number;
}

export function claimBonus(userId: string, bonusId: string): ClaimResult {
  const bonus = BONUSES.find((b) => b.id === bonusId);
  if (!bonus) throw new Error('Unknown bonus');
  const set = claimed.get(userId) || new Set<string>();

  if (bonusId === 'rakeback') {
    const user = getUser(userId);
    const amount = user?.rakeback ?? 0;
    if (amount <= 0) throw new Error('No rakeback to claim yet');
    const updated = adjustBalance(userId, amount, { reason: 'rakeback-claim' });
    // reset rakeback bucket
    updated.rakeback = 0;
    return { bonus, reward: amount, balance: updated.balance };
  }

  if (set.has(bonusId)) throw new Error('Bonus already claimed');
  const reward = bonus.id === 'daily' ? Math.round(200 + Math.random() * 800) : bonus.reward;
  const user = adjustBalance(userId, reward, { reason: `bonus:${bonusId}` });
  set.add(bonusId);
  claimed.set(userId, set);
  return { bonus, reward, balance: user.balance };
}
