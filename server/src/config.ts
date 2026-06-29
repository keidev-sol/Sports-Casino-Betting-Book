import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load .env from the project root (one level above /server)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const list = (v: string | undefined, fallback: string): string[] =>
  (v ?? fallback)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

export interface OddsConfig {
  apiKey: string;
  baseUrl: string;
  regions: string;
  markets: string;
  oddsFormat: string;
  sports: string[];
  cacheTtl: number;
}

export interface AppConfig {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  startingBalance: number;
  odds: OddsConfig;
  readonly mockMode: boolean;
}

export const config: AppConfig = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  startingBalance: Number(process.env.STARTING_BALANCE) || 10000,

  odds: {
    apiKey: process.env.ODDS_API_KEY || '',
    baseUrl: 'https://api.the-odds-api.com/v4',
    regions: list(process.env.ODDS_REGIONS, 'us,uk,eu').join(','),
    markets: list(process.env.ODDS_MARKETS, 'h2h,spreads,totals').join(','),
    oddsFormat: process.env.ODDS_FORMAT || 'decimal',
    sports: list(
      process.env.ODDS_SPORTS,
      'soccer_epl,basketball_nba,americanfootball_nfl,icehockey_nhl,baseball_mlb,mma_mixed_martial_arts'
    ),
    cacheTtl: Number(process.env.ODDS_CACHE_TTL) || 60,
  },

  // When no API key is configured we serve deterministic mock data so the
  // platform is fully functional offline / in CI.
  get mockMode(): boolean {
    return !this.odds.apiKey;
  },
};
