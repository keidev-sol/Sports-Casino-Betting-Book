import crypto from 'crypto';

// Provably-fair primitives shared by Roulette and Crash.
// A round commits to a serverSeed by publishing its SHA-256 hash up front;
// after the round we reveal serverSeed so players can verify the outcome.

export function newServerSeed() {
  const serverSeed = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(serverSeed).digest('hex');
  return { serverSeed, hash };
}

export function hmacFloat(serverSeed, clientSeed, nonce) {
  const hmac = crypto
    .createHmac('sha256', serverSeed)
    .update(`${clientSeed}:${nonce}`)
    .digest('hex');
  // Use the first 8 hex chars → [0, 1)
  const int = parseInt(hmac.slice(0, 8), 16);
  return int / 0xffffffff;
}

// Crash multiplier with a configurable house edge (3%).
export function crashPoint(serverSeed, clientSeed, nonce, houseEdge = 0.03) {
  const h = crypto
    .createHmac('sha256', serverSeed)
    .update(`${clientSeed}:${nonce}`)
    .digest('hex');
  const int = parseInt(h.slice(0, 13), 16);
  const e = 2 ** 52;
  // ~1 in (1/houseEdge) rounds bust instantly at 1.00x
  if (int % Math.round(1 / houseEdge) === 0) return 1.0;
  const result = Math.floor((100 * e - int) / (e - int)) / 100;
  return Math.max(1.0, result);
}

export function rouletteRoll(serverSeed, clientSeed, nonce) {
  // European-style wheel slot in [0, 14] for the X-Roulette layout.
  return Math.floor(hmacFloat(serverSeed, clientSeed, nonce) * 15);
}
