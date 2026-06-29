import type { Sport, OddsEvent, Outcome, Bookmaker } from '../../../shared/types.js';

// Deterministic mock data so Crow runs with zero external dependencies.
// Shapes mirror The Odds API v4 response exactly, so the rest of the code
// path is identical whether we're in live or mock mode.

const SPORT_CATALOG: Sport[] = [
  { key: 'soccer_epl', group: 'Soccer', title: 'EPL', description: 'English Premier League', active: true, has_outrights: false },
  { key: 'basketball_nba', group: 'Basketball', title: 'NBA', description: 'US Basketball', active: true, has_outrights: false },
  { key: 'americanfootball_nfl', group: 'American Football', title: 'NFL', description: 'US Football', active: true, has_outrights: false },
  { key: 'icehockey_nhl', group: 'Ice Hockey', title: 'NHL', description: 'US Ice Hockey', active: true, has_outrights: false },
  { key: 'baseball_mlb', group: 'Baseball', title: 'MLB', description: 'Major League Baseball', active: true, has_outrights: false },
  { key: 'mma_mixed_martial_arts', group: 'Mixed Martial Arts', title: 'MMA', description: 'MMA', active: true, has_outrights: false },
  { key: 'tennis_atp', group: 'Tennis', title: 'ATP', description: 'ATP Tour', active: true, has_outrights: false },
  { key: 'cricket_ipl', group: 'Cricket', title: 'IPL', description: 'Indian Premier League', active: true, has_outrights: false },
];

const TEAMS: Record<string, string[]> = {
  soccer_epl: ['Arsenal', 'Man City', 'Liverpool', 'Chelsea', 'Tottenham', 'Man United', 'Newcastle', 'Aston Villa'],
  basketball_nba: ['Lakers', 'Celtics', 'Warriors', 'Nuggets', 'Bucks', 'Heat', 'Suns', '76ers'],
  americanfootball_nfl: ['Chiefs', 'Eagles', 'Bills', '49ers', 'Cowboys', 'Ravens', 'Bengals', 'Lions'],
  icehockey_nhl: ['Rangers', 'Bruins', 'Oilers', 'Avalanche', 'Panthers', 'Maple Leafs', 'Golden Knights', 'Stars'],
  baseball_mlb: ['Dodgers', 'Yankees', 'Braves', 'Astros', 'Orioles', 'Rangers', 'Phillies', 'Mets'],
  mma_mixed_martial_arts: ['Jones', 'Adesanya', 'Makhachev', 'Pereira', 'Edwards', 'Volkanovski', "O'Malley", 'Du Plessis'],
  tennis_atp: ['Alcaraz', 'Sinner', 'Djokovic', 'Medvedev', 'Zverev', 'Rune', 'Rublev', 'Fritz'],
  cricket_ipl: ['Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Delhi', 'Hyderabad', 'Punjab', 'Rajasthan'],
};

const BOOKMAKERS = [
  { key: 'fanduel', title: 'FanDuel' },
  { key: 'draftkings', title: 'DraftKings' },
  { key: 'betmgm', title: 'BetMGM' },
];

// Simple seeded PRNG (mulberry32) keyed off a string → reproducible odds.
function seeded(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (n: number, d = 2): number => Math.round(n * 10 ** d) / 10 ** d;

export function mockSports(): Sport[] {
  return SPORT_CATALOG;
}

export function mockOdds(sportKey: string, { eventsPerSport = 8 }: { eventsPerSport?: number } = {}): OddsEvent[] {
  const teams = TEAMS[sportKey] || TEAMS.soccer_epl;
  const isSoccer = sportKey.startsWith('soccer');
  const events: OddsEvent[] = [];

  for (let i = 0; i < eventsPerSport; i++) {
    const home = teams[(i * 2) % teams.length];
    const away = teams[(i * 2 + 1) % teams.length];
    const id = `${sportKey}-${i}`;
    const rng = seeded(id);
    const commence = new Date(Date.now() + (i + 1) * 3600 * 1000 * 3).toISOString();

    // Base probabilities → fair decimal odds with a small bookmaker margin.
    const pHome = 0.3 + rng() * 0.45;
    const pAway = isSoccer ? (1 - pHome) * (0.55 + rng() * 0.3) : 1 - pHome;
    const pDraw = isSoccer ? Math.max(0.05, 1 - pHome - pAway) : 0;
    const margin = 1.06;
    const dec = (p: number): number => round(Math.max(1.04, 1 / (p * margin)));

    const h2hOutcomes: Outcome[] = [
      { name: home, price: dec(pHome) },
      { name: away, price: dec(pAway) },
    ];
    if (isSoccer) h2hOutcomes.splice(1, 0, { name: 'Draw', price: dec(pDraw) });

    const spread = round(1 + rng() * 9, 1);
    const total = round((isSoccer ? 2 : 200) + rng() * (isSoccer ? 4 : 30), 1);

    const bookmakers: Bookmaker[] = BOOKMAKERS.map((bm, bi) => {
      const wob = (o: Outcome): number => round(o.price * (1 + (bi - 1) * 0.015 + (rng() - 0.5) * 0.02));
      return {
        key: bm.key,
        title: bm.title,
        last_update: commence,
        markets: [
          { key: 'h2h', last_update: commence, outcomes: h2hOutcomes.map((o) => ({ name: o.name, price: wob(o) })) },
          {
            key: 'spreads',
            last_update: commence,
            outcomes: [
              { name: home, price: round(1.9 + (rng() - 0.5) * 0.1), point: -spread },
              { name: away, price: round(1.9 + (rng() - 0.5) * 0.1), point: spread },
            ],
          },
          {
            key: 'totals',
            last_update: commence,
            outcomes: [
              { name: 'Over', price: round(1.9 + (rng() - 0.5) * 0.1), point: total },
              { name: 'Under', price: round(1.9 + (rng() - 0.5) * 0.1), point: total },
            ],
          },
        ],
      };
    });

    events.push({
      id,
      sport_key: sportKey,
      sport_title: SPORT_CATALOG.find((s) => s.key === sportKey)?.title || sportKey,
      commence_time: commence,
      home_team: home,
      away_team: away,
      bookmakers,
    });
  }
  return events;
}

export { SPORT_CATALOG };
