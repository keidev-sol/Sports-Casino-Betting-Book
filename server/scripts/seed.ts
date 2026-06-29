// Optional smoke-test: pings the running server and prints a quick health/feed
// summary. Useful to confirm your ODDS_API_KEY and connectivity.
//   npm run seed
import type { Quota, FeaturedGroup, DiceResult, AuthResponse } from '../../shared/types.js';

const base = process.env.BASE_URL || 'http://localhost:4000';

const main = async (): Promise<void> => {
  const health = await fetch(`${base}/api/health`).then((r) => r.json());
  console.log('Health:', health);

  const { feed, quota } = (await fetch(`${base}/api/featured`).then((r) => r.json())) as {
    feed: FeaturedGroup[];
    quota: Quota;
  };
  console.log('Mode  :', quota.mockMode ? 'MOCK' : 'LIVE', '| credits left:', quota.remaining ?? 'n/a');
  for (const g of feed) {
    console.log(`  ${g.sportKey.padEnd(28)} ${g.events.length} events`);
  }

  const { token } = (await fetch(`${base}/api/auth/guest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  }).then((r) => r.json())) as AuthResponse;

  const dice = (await fetch(`${base}/api/casino/dice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ wager: 10, target: 50, direction: 'over' }),
  }).then((r) => r.json())) as { result: DiceResult };
  console.log('Demo dice roll:', dice.result.roll, dice.result.won ? '✓ win' : '✗ lose');
};

main().catch((e: unknown) => {
  console.error('Seed failed — is the server running? (npm run dev:server)\n', (e as Error).message);
  process.exit(1);
});
