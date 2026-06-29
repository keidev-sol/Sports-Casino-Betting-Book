// Captures real screenshots of the running app with Playwright (Chromium).
// Usage: node scripts/screenshots.mjs   (server must be serving on :4000)
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../docs/assets/screens');
const BASE = process.env.BASE_URL || 'http://localhost:4000';
mkdirSync(OUT, { recursive: true });

const shots = [
  { name: 'home', path: '/', wait: 2600 },
  { name: 'sports', path: '/sports', wait: 2600 },
  { name: 'casino', path: '/casino', wait: 1600 },
  { name: 'crash', path: '/crash', wait: 4200 },
  { name: 'roulette', path: '/roulette', wait: 2800 },
  { name: 'jackpot', path: '/jackpot', wait: 2200 },
  { name: 'dice', path: '/casino/dice', wait: 1400 },
  { name: 'bonus', path: '/bonus', wait: 1600 },
];

const run = async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: 'dark',
  });
  const page = await ctx.newPage();

  // Prime the session once (auto guest-login) so balances render.
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  for (const s of shots) {
    await page.goto(`${BASE}${s.path}`, { waitUntil: 'networkidle' });
    // wait for the hero image / data / ws state to settle
    await page.waitForTimeout(s.wait);
    await page.screenshot({ path: path.join(OUT, `${s.name}.png`) });
    console.log('captured', s.name);
  }

  // A taller full-page capture of the home lobby for the README header.
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2600);
  await page.screenshot({ path: path.join(OUT, 'home-full.png'), fullPage: true });
  console.log('captured home-full');

  await browser.close();
};

run().catch((e) => {
  console.error('screenshot run failed:', e.message);
  process.exit(1);
});
