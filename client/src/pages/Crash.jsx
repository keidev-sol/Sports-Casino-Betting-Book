import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { subscribe } from '../lib/ws.js';
import { api } from '../lib/api.js';
import { useStore } from '../store/useStore.js';
import { Icon } from '../components/Icons.jsx';

function CurveChart({ multiplier, state }) {
  // Map multiplier → curve. Build a smooth exponential path.
  const W = 600, H = 320;
  const max = Math.max(2, multiplier * 1.1);
  const points = [];
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const m = 1 + (multiplier - 1) * t;
    const x = t * W;
    const y = H - ((m - 1) / (max - 1)) * (H - 20) - 10;
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  const crashed = state === 'crashed';
  const color = crashed ? '#ff3b5c' : multiplier > 2 ? '#00e701' : '#7c5cff';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke="#ffffff" strokeOpacity="0.04" />
      ))}
      <polygon points={`0,${H} ${points.join(' ')} ${W},${H}`} fill="url(#fill)" />
      <polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function Crash() {
  const { user, refreshUser, notify } = useStore();
  const [snap, setSnap] = useState({ state: 'betting', multiplier: 1, players: [], history: [] });
  const [wager, setWager] = useState(50);
  const [autoCashout, setAutoCashout] = useState('');
  const [betting, setBetting] = useState(false);
  const hasBet = useRef(false);

  useEffect(() => {
    const unsub = subscribe('crash', (f) => {
      if (f.type === 'state') {
        setSnap(f.data);
        if (f.data.state === 'betting') hasBet.current = false;
      } else if (f.type === 'tick') {
        setSnap((s) => ({ ...s, multiplier: f.data.multiplier }));
      } else if (f.type === 'cashout') {
        if (f.data.username === user?.username) {
          notify(`Cashed out at ${f.data.multiplier}× → +${f.data.payout} 🚀`, 'success');
          refreshUser();
        }
      }
    });
    return unsub;
  }, [user?.username]);

  const place = async () => {
    setBetting(true);
    try {
      await api.crashBet(Number(wager), autoCashout ? Number(autoCashout) : null);
      hasBet.current = true;
      await refreshUser();
      notify('Bet placed — good luck! 🎢', 'success');
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setBetting(false);
    }
  };

  const cashout = async () => {
    try {
      const r = await api.crashCashout();
      await refreshUser();
      notify(`Cashed out at ${r.multiplier}× → +${r.payout}`, 'success');
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  const running = snap.state === 'running';
  const crashed = snap.state === 'crashed';

  return (
    <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-white">
            <Icon.Crash className="h-6 w-6 text-neon-purple" /> Crash
          </h1>
          <span className="chip bg-ink-800 text-slate-400">99% RTP • Provably Fair</span>
        </div>

        {/* history */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {snap.history.map((h) => (
            <span
              key={h.roundId}
              className={clsx(
                'chip shrink-0 font-mono',
                h.bust >= 2 ? 'bg-neon-green/10 text-neon-green' : 'bg-neon-red/10 text-neon-red'
              )}
            >
              {h.bust.toFixed(2)}×
            </span>
          ))}
        </div>

        <div className="relative panel overflow-hidden p-0">
          <div className="relative h-[340px] w-full">
            <CurveChart multiplier={snap.multiplier} state={snap.state} />
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div
                  className={clsx(
                    'font-mono text-6xl font-black md:text-7xl',
                    crashed ? 'text-neon-red' : running ? 'text-neon-green' : 'text-white'
                  )}
                >
                  {Number(snap.multiplier).toFixed(2)}×
                </div>
                <div className="mt-2 text-sm font-semibold uppercase tracking-widest text-slate-400">
                  {snap.state === 'betting' && '⏳ Place your bets'}
                  {running && '🚀 In flight…'}
                  {crashed && '💥 Crashed'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* live players */}
        <div className="panel p-4">
          <div className="mb-2 text-sm font-bold text-white">Players this round ({snap.players.length})</div>
          <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto md:grid-cols-3">
            {snap.players.map((p, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-ink-800 px-3 py-2 text-xs">
                <span className="truncate text-slate-300">{p.username}</span>
                <span className={clsx('font-mono font-bold', p.cashedAt ? 'text-neon-green' : 'text-slate-500')}>
                  {p.cashedAt ? `${p.cashedAt}×` : `${p.wager}`}
                </span>
              </div>
            ))}
            {!snap.players.length && <p className="col-span-full text-xs text-slate-500">No players yet — be the first.</p>}
          </div>
        </div>
      </div>

      {/* bet panel */}
      <aside className="space-y-3">
        <div className="panel space-y-4 p-4">
          <div>
            <label className="mb-1 block text-xs text-slate-400">Bet amount</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={wager}
                onChange={(e) => setWager(Number(e.target.value))}
                className="w-full rounded-xl border border-white/5 bg-ink-800 px-3 py-2.5 font-mono text-white outline-none focus:border-neon-purple/50"
              />
              <button onClick={() => setWager((w) => Math.max(1, Math.floor(w / 2)))} className="btn-ghost px-3">½</button>
              <button onClick={() => setWager((w) => w * 2)} className="btn-ghost px-3">2×</button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-400">Auto cash-out (optional)</label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 2.0"
              value={autoCashout}
              onChange={(e) => setAutoCashout(e.target.value)}
              className="w-full rounded-xl border border-white/5 bg-ink-800 px-3 py-2.5 font-mono text-white outline-none focus:border-neon-purple/50"
            />
          </div>

          {running ? (
            <button onClick={cashout} className="btn-green w-full py-3.5 text-base">
              Cash Out · {Number(snap.multiplier).toFixed(2)}×
            </button>
          ) : (
            <button
              disabled={betting || snap.state !== 'betting'}
              onClick={place}
              className="btn-primary w-full py-3.5 text-base"
            >
              {snap.state === 'betting' ? (betting ? 'Placing…' : 'Place Bet') : 'Waiting for next round…'}
            </button>
          )}

          <div className="flex items-center justify-between rounded-xl bg-ink-800 px-3 py-2 text-sm">
            <span className="text-slate-400">Balance</span>
            <span className="font-mono font-bold text-neon-green">{Number(user?.balance || 0).toFixed(2)}</span>
          </div>
        </div>

        <div className="panel p-4 text-xs leading-relaxed text-slate-400">
          <div className="mb-1 flex items-center gap-2 font-bold text-white">
            <Icon.Shield className="h-4 w-4 text-neon-green" /> How it works
          </div>
          The multiplier climbs from 1.00×. Cash out before the curve busts to lock in your winnings.
          Set an auto cash-out to exit hands-free.
        </div>
      </aside>
    </div>
  );
}
