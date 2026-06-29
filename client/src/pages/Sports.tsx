import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { api } from '../lib/api';
import EventCard from '../components/EventCard';
import BetSlip from '../components/BetSlip';
import { Icon } from '../components/Icons';
import type { Sport, OddsEvent } from '@shared/types';

export default function Sports() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [events, setEvents] = useState<OddsEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.sports().then((d) => {
      const list = (d.sports || []).filter((s) => !s.has_outrights);
      setSports(list);
      const first = list[0]?.key;
      setActive(first);
    });
  }, []);

  useEffect(() => {
    if (!active) return;
    setLoading(true);
    api.odds(active).then((d) => {
      setEvents(d.events || []);
      setLoading(false);
    });
  }, [active]);

  const groups = sports.reduce<Record<string, Sport[]>>((acc, s) => {
    (acc[s.group] = acc[s.group] || []).push(s);
    return acc;
  }, {});

  return (
    <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[220px_1fr_320px]">
      {/* Sports nav */}
      <aside className="hidden lg:block">
        <div className="panel sticky top-20 max-h-[80vh] overflow-y-auto p-3">
          <h3 className="px-2 pb-2 text-xs font-bold uppercase tracking-wide text-slate-500">All Sports</h3>
          {Object.entries(groups).map(([group, items]) => (
            <div key={group} className="mb-2">
              <div className="px-2 py-1 text-[11px] font-semibold uppercase text-slate-600">{group}</div>
              {items.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setActive(s.key)}
                  className={clsx(
                    'flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm font-medium transition-colors',
                    active === s.key ? 'bg-ink-800 text-white' : 'text-slate-400 hover:bg-ink-800/60'
                  )}
                >
                  {s.title}
                  {active === s.key && <span className="h-1.5 w-1.5 rounded-full bg-neon-green" />}
                </button>
              ))}
            </div>
          ))}
        </div>
      </aside>

      {/* Events */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <h1 className="text-2xl font-extrabold text-white">Sportsbook</h1>
          <span className="chip bg-neon-red/15 text-neon-red animate-pulseGlow">
            <Icon.Live className="h-3.5 w-3.5" /> LIVE
          </span>
        </div>

        {/* mobile sport pills */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {sports.map((s) => (
            <button
              key={s.key}
              onClick={() => setActive(s.key)}
              className={clsx('chip shrink-0', active === s.key ? 'bg-neon-purple text-white' : 'bg-ink-800 text-slate-400')}
            >
              {s.title}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid h-64 place-items-center text-slate-500">Loading odds…</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
            {!events.length && <p className="text-slate-500">No events available for this sport right now.</p>}
          </div>
        )}
      </div>

      {/* Bet slip */}
      <aside className="hidden lg:block">
        <BetSlip />
      </aside>
    </div>
  );
}
