import fetch from 'node-fetch';
import { config } from '../config.js';
import { mockSports, mockOdds } from './mockData.js';

// In-memory TTL cache to protect the (limited) Odds API quota. The same cache
// transparently serves mock data when no API key is present.
const cache = new Map();
let quota = { remaining: null, used: null };

function getCached(key) {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;
  return null;
}

function setCached(key, value, ttl = config.odds.cacheTtl) {
  cache.set(key, { value, expires: Date.now() + ttl * 1000 });
  return value;
}

async function apiGet(pathname, params = {}) {
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
  return res.json();
}

export async function listSports() {
  const key = 'sports';
  const cached = getCached(key);
  if (cached) return cached;

  if (config.mockMode) return setCached(key, mockSports(), 3600);
  try {
    const data = await apiGet('/sports/', { all: 'false' });
    return setCached(key, data, 3600);
  } catch (err) {
    console.warn('[oddsApi] listSports failed, serving mock:', err.message);
    return setCached(key, mockSports(), 30);
  }
}

export async function getOdds(sportKey) {
  const key = `odds:${sportKey}`;
  const cached = getCached(key);
  if (cached) return cached;

  if (config.mockMode) return setCached(key, mockOdds(sportKey), config.odds.cacheTtl);
  try {
    const data = await apiGet(`/sports/${sportKey}/odds/`, {
      regions: config.odds.regions,
      markets: config.odds.markets,
      oddsFormat: config.odds.oddsFormat,
    });
    return setCached(key, data);
  } catch (err) {
    console.warn(`[oddsApi] getOdds(${sportKey}) failed, serving mock:`, err.message);
    return setCached(key, mockOdds(sportKey), 30);
  }
}

// Pull a curated multi-sport feed for the homepage in one call.
export async function getFeaturedFeed() {
  const results = await Promise.all(
    config.odds.sports.map(async (sportKey) => {
      const events = await getOdds(sportKey);
      return { sportKey, events: events.slice(0, 8) };
    })
  );
  return results;
}

export function getQuota() {
  return { ...quota, mockMode: config.mockMode };
}
