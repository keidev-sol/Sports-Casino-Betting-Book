import { config } from '../config.js';
import { mockSports, mockOdds } from './mockData.js';
import type { Sport, OddsEvent, Quota, FeaturedGroup } from '../../../shared/types.js';

// In-memory TTL cache to protect the (limited) Odds API quota. The same cache
// transparently serves mock data when no API key is present.
interface CacheEntry<T> {
  value: T;
  expires: number;
}
const cache = new Map<string, CacheEntry<unknown>>();
let quota: { remaining: number | null; used: number | null } = { remaining: null, used: null };

function getCached<T>(key: string): T | null {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as T;
  return null;
}

function setCached<T>(key: string, value: T, ttl: number = config.odds.cacheTtl): T {
  cache.set(key, { value, expires: Date.now() + ttl * 1000 });
  return value;
}

async function apiGet<T>(pathname: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${config.odds.baseUrl}${pathname}`);
  url.searchParams.set('apiKey', config.odds.apiKey);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  }

  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  quota = {
    remaining: Number(res.headers.get('x-requests-remaining')) || quota.remaining,
    used: Number(res.headers.get('x-requests-used')) || quota.used,
  };
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Odds API ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

export async function listSports(): Promise<Sport[]> {
  const key = 'sports';
  const cached = getCached<Sport[]>(key);
  if (cached) return cached;

  if (config.mockMode) return setCached(key, mockSports(), 3600);
  try {
    const data = await apiGet<Sport[]>('/sports/', { all: 'false' });
    return setCached(key, data, 3600);
  } catch (err) {
    console.warn('[oddsApi] listSports failed, serving mock:', (err as Error).message);
    return setCached(key, mockSports(), 30);
  }
}

export async function getOdds(sportKey: string): Promise<OddsEvent[]> {
  const key = `odds:${sportKey}`;
  const cached = getCached<OddsEvent[]>(key);
  if (cached) return cached;

  if (config.mockMode) return setCached(key, mockOdds(sportKey), config.odds.cacheTtl);
  try {
    const data = await apiGet<OddsEvent[]>(`/sports/${sportKey}/odds/`, {
      regions: config.odds.regions,
      markets: config.odds.markets,
      oddsFormat: config.odds.oddsFormat,
    });
    return setCached(key, data);
  } catch (err) {
    console.warn(`[oddsApi] getOdds(${sportKey}) failed, serving mock:`, (err as Error).message);
    return setCached(key, mockOdds(sportKey), 30);
  }
}

// Pull a curated multi-sport feed for the homepage in one call.
export async function getFeaturedFeed(): Promise<FeaturedGroup[]> {
  const results = await Promise.all(
    config.odds.sports.map(async (sportKey) => {
      const events = await getOdds(sportKey);
      return { sportKey, events: events.slice(0, 8) };
    })
  );
  return results;
}

export function getQuota(): Quota {
  return { ...quota, mockMode: config.mockMode };
}
