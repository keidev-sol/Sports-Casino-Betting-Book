// Static lobby catalog for the casino landing page. `route` points at an
// in-house playable game; `external: true` games are showcase tiles.
export const CASINO_GAMES = [
  { id: 'crash', name: 'Crash', provider: 'Crow Originals', category: 'originals', rtp: 99, route: '/crash', accent: '#7c5cff', tag: 'LIVE' },
  { id: 'roulette', name: 'X-Roulette', provider: 'Crow Originals', category: 'originals', rtp: 97, route: '/roulette', accent: '#00e701', tag: 'LIVE' },
  { id: 'dice', name: 'Dice', provider: 'Crow Originals', category: 'originals', rtp: 99, route: '/casino/dice', accent: '#ff4d8d', tag: 'INSTANT' },
  { id: 'jackpot', name: 'Jackpot', provider: 'Crow Originals', category: 'originals', rtp: 95, route: '/jackpot', accent: '#ffb800', tag: 'POOL' },
  { id: 'mines', name: 'Mines', provider: 'Crow Originals', category: 'originals', rtp: 99, external: true, accent: '#22d3ee' },
  { id: 'plinko', name: 'Plinko', provider: 'Crow Originals', category: 'originals', rtp: 99, external: true, accent: '#a855f7' },
  { id: 'towers', name: 'Towers', provider: 'Crow Originals', category: 'originals', rtp: 98, external: true, accent: '#f97316' },
  { id: 'blackjack', name: 'Blackjack', provider: 'Evolution', category: 'table', rtp: 99.5, external: true, accent: '#16a34a' },
  { id: 'gates-olympus', name: 'Gates of Olympus', provider: 'Pragmatic Play', category: 'slots', rtp: 96.5, external: true, accent: '#eab308' },
  { id: 'sweet-bonanza', name: 'Sweet Bonanza', provider: 'Pragmatic Play', category: 'slots', rtp: 96.48, external: true, accent: '#ec4899' },
  { id: 'wanted', name: 'Wanted Dead or a Wild', provider: 'Hacksaw', category: 'slots', rtp: 96.38, external: true, accent: '#ef4444' },
  { id: 'lightning-roulette', name: 'Lightning Roulette', provider: 'Evolution', category: 'live', rtp: 97.3, external: true, accent: '#facc15' },
];

export const CASINO_CATEGORIES = [
  { id: 'originals', label: 'Crow Originals' },
  { id: 'slots', label: 'Slots' },
  { id: 'live', label: 'Live Casino' },
  { id: 'table', label: 'Table Games' },
];
