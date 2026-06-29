import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { subscribe } from '../lib/ws.js';
import { api } from '../lib/api.js';
import { useStore } from '../store/useStore.js';
import { Icon } from '../components/Icons.jsx';

const COLORS = {
  red: { bg: 'bg-neon-red', text: 'text-neon-red', label: 'Red', payout: '2×' },
  black: { bg: 'bg-ink-700', text: 'text-slate-300', label: 'Black', payout: '2×' },
  green: { bg: 'bg-neon-green', text: 'text-neon-green', label: 'Green', payout: '14×' },
};

function Countdown({ endsAt }) {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setLeft(Math.max(0, (endsAt - Date.now()) / 1000)), 100);
    return () => clearInterval(t);
  }, [endsAt]);
  return <span className="font-mono">{left.toFixed(1)}s</span>;
}

export default function Roulette() {
  const { user, refreshUser, notify } = useStore();
  const [snap, setSnap] = useState({ state: 'betting', bets: [], history: [], slots: [] });
  const [amount, setAmount] = useState(25);

  useEffect(() => {
    return subscribe('roulette', (f) => {
      if (f.type === 'state') setSnap(f.data);
      else if (f.type === 'win' && f.data.username === user?.username) {
        notify(`Roulette win on ${f.data.color} → +${f.data.payout} 🎉`, 'success');
        refreshUser();
      }
    });
  }, [user?.username]);

  const bet = async (color) => {
    try {
      await api.rouletteBet(color, Number(amount));
      await refreshUser();
      notify(`Bet ${amount} on ${color}`, 'info');
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  const result = snap.result;
  const spinning = snap.state === 'spinning';
  const totalOn = (color) => snap.bets.filter((b) => b.color === color).reduce((s, b) => s + b.amount, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex items-center gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-white">
          <Icon.Roulette className="h-6 w-6 text-neon-green" /> X-Roulette
        </h1>
        <span className="chip bg-ink-800 text-slate-400">Spins every 12s</span>
      </div>

      {/* history */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {snap.history.map((h, i) => (
          <span key={i} className={clsx('grid h-8 w-8 shrink-0 place-items-center rounded-lg font-mono text-xs font-bold text-white', COLORS[h.color].bg)}>
            {h.n}
          </span>
        ))}
      </div>

      {/* wheel / result */}
      <div className="panel grid place-items-center p-10">
        <div
          className={clsx(
            'grid h-40 w-40 place-items-center rounded-full border-4 transition-all duration-500',
            spinning ? 'animate-spin border-neon-purple' : 'border-white/10',
            result && !spinning && COLORS[result.color].bg
          )}
        >
          <div className="grid h-28 w-28 place-items-center rounded-full bg-ink-900">
            <div className="text-center">
              {snap.state === 'spinning' && <div className="text-sm text-slate-400">Spinning…</div>}
              {snap.state === 'betting' && (
                <>
                  <div className="text-xs text-slate-500">Betting closes in</div>
                  <div className="text-2xl font-bold text-white">{snap.endsAt ? <Countdown endsAt={snap.endsAt} /> : '—'}</div>
                </>
              )}
              {snap.state === 'ended' && result && (
                <>
                  <div className={clsx('text-4xl font-black', COLORS[result.color].text)}>{result.n}</div>
                  <div className="text-xs uppercase text-slate-400">{result.color}</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* amount */}
      <div className="panel flex items-center gap-3 p-4">
        <span className="text-sm text-slate-400">Bet amount</span>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-28 rounded-xl border border-white/5 bg-ink-800 px-3 py-2 font-mono text-white outline-none focus:border-neon-purple/50"
        />
        {[10, 25, 100].map((v) => (
          <button key={v} onClick={() => setAmount(v)} className="btn-ghost px-3 py-2 text-xs">{v}</button>
        ))}
        <span className="ml-auto font-mono text-sm text-neon-green">{Number(user?.balance || 0).toFixed(2)}</span>
      </div>

      {/* bet buttons */}
      <div className="grid grid-cols-3 gap-3">
        {['red', 'green', 'black'].map((c) => (
          <button
            key={c}
            disabled={snap.state !== 'betting'}
            onClick={() => bet(c)}
            className={clsx(
              'relative flex flex-col items-center gap-1 rounded-2xl border border-white/10 p-5 font-bold transition-all hover:brightness-110 disabled:opacity-40',
              c === 'green' ? 'bg-neon-green/15' : c === 'red' ? 'bg-neon-red/15' : 'bg-ink-700'
            )}
          >
            <span className={clsx('text-lg', COLORS[c].text)}>{COLORS[c].label} {COLORS[c].payout}</span>
            <span className="text-xs text-slate-400">Total on: {totalOn(c)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
