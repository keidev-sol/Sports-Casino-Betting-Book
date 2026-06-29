import clsx from 'clsx';
import { useStore } from '../store/useStore.js';

// Picks the first bookmaker that has the requested market.
function marketOf(event, key) {
  for (const bm of event.bookmakers || []) {
    const m = bm.markets?.find((mk) => mk.key === key);
    if (m) return m;
  }
  return null;
}

function timeLabel(iso) {
  const d = new Date(iso);
  const diff = d - Date.now();
  if (diff < 0) return 'LIVE';
  const h = Math.floor(diff / 3.6e6);
  if (h < 1) return `${Math.max(1, Math.floor(diff / 6e4))}m`;
  if (h < 24) return `${h}h`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function EventCard({ event }) {
  const { betSlip, addLeg } = useStore();
  const h2h = marketOf(event, 'h2h');
  const live = new Date(event.commence_time) < Date.now();

  const toggle = (outcome) => {
    const id = `${event.id}:h2h:${outcome.name}`;
    addLeg({
      id,
      eventId: event.id,
      event: `${event.home_team} v ${event.away_team}`,
      label: `${outcome.name} — ML`,
      market: 'Moneyline',
      price: outcome.price,
    });
  };

  const selected = (name) => betSlip.some((l) => l.id === `${event.id}:h2h:${name}`);

  return (
    <div className="panel p-4 transition-colors hover:border-white/10">
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="font-semibold uppercase tracking-wide text-slate-500">{event.sport_title || event.sport_key}</span>
        <span className={clsx('chip', live ? 'bg-neon-red/15 text-neon-red animate-pulseGlow' : 'bg-ink-700 text-slate-400')}>
          {live ? '● LIVE' : timeLabel(event.commence_time)}
        </span>
      </div>

      <div className="mb-3 space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-white">{event.home_team}</span>
          <span className="text-xs text-slate-500">Home</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-white">{event.away_team}</span>
          <span className="text-xs text-slate-500">Away</span>
        </div>
      </div>

      <div className="flex gap-2">
        {h2h ? (
          h2h.outcomes.map((o) => (
            <button
              key={o.name}
              onClick={() => toggle(o)}
              className={clsx('odd-btn', selected(o.name) && 'border-neon-purple bg-neon-purple/15')}
            >
              <span className="max-w-[80px] truncate text-[11px] text-slate-400">{o.name === 'Draw' ? 'Draw' : o.name}</span>
              <span className="font-mono text-sm font-bold text-neon-green">{Number(o.price).toFixed(2)}</span>
            </button>
          ))
        ) : (
          <span className="text-xs text-slate-500">Odds unavailable</span>
        )}
      </div>
    </div>
  );
}
