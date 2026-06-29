import { useEffect, useState } from 'react';
import { subscribe } from '../lib/ws';
import { Icon } from './Icons';
import type { ActivityItem } from '@shared/types';

// Bottom marquee of recent wins across the platform.
export default function LiveTicker() {
  const [feed, setFeed] = useState<ActivityItem[]>([]);

  useEffect(
    () => subscribe('activity', (f) => f.type === 'feed' && setFeed(f.data as ActivityItem[])),
    []
  );

  if (!feed.length) return null;
  const items = [...feed, ...feed]; // duplicate for seamless loop

  return (
    <div className="sticky bottom-0 z-20 flex items-center gap-3 border-t border-white/5 bg-ink-900/90 px-4 py-2 backdrop-blur">
      <div className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-neon-green">
        <Icon.Live className="h-4 w-4" /> LIVE WINS
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="flex w-max animate-marquee gap-3">
          {items.map((it, i) => (
            <div key={i} className="flex shrink-0 items-center gap-2 rounded-lg border border-white/5 bg-ink-800 px-3 py-1.5 text-xs">
              <span className="font-semibold text-slate-300">{it.user}</span>
              <span className="text-slate-500">on</span>
              <span className="font-semibold text-neon-violet">{it.game}</span>
              <span className="rounded bg-neon-green/10 px-1.5 py-0.5 font-mono font-bold text-neon-green">
                {it.payout > 0 ? `+${Number(it.payout).toLocaleString()}` : '—'}
              </span>
              {it.multiplier ? <span className="font-mono text-slate-500">{Number(it.multiplier).toFixed(2)}×</span> : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
