// Optional smoke-test: pings the running server and prints a quick health/feed
// summary. Useful to confirm your ODDS_API_KEY and connectivity.
//   node server/scripts/seed.js
const base = process.env.BASE_URL || 'http://localhost:4000';

const main = async () => {
  const health = await fetch(`${base}/api/health`).then((r) => r.json());
  console.log('Health:', health);

  const { feed, quota } = await fetch(`${base}/api/featured`).then((r) => r.json());
  console.log('Mode  :', quota.mockMode ? 'MOCK' : 'LIVE', '| credits left:', quota.remaining ?? 'n/a');
  for (const g of feed) {
    console.log(`  ${g.sportKey.padEnd(28)} ${g.events.length} events`);
  }

  const { token } = await fetch(`${base}/api/auth/guest`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).then((r) => r.json());
  const dice = await fetch(`${base}/api/casino/dice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ wager: 10, target: 50, direction: 'over' }),
  }).then((r) => r.json());
  console.log('Demo dice roll:', dice.result.roll, dice.result.won ? '✓ win' : '✗ lose');
};

main().catch((e) => {
  console.error('Seed failed — is the server running? (npm run dev:server)\n', e.message);
  process.exit(1);
});
