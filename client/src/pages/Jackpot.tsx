import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { subscribe } from '../lib/ws';
import { api } from '../lib/api';
import { useStore } from '../store/useStore';
import { Icon } from '../components/Icons';
import type { JackpotSnapshot } from '@shared/types';

const SEGMENT_COLORS: string[] = ['#e8b923', '#19c964', '#f0a52e', '#ffc233', '#3aa0ff', '#ff4d6a', '#f4d168', '#4ade80'];

function Countdown({ endsAt }: { endsAt: number }) {
  const [left, setLeft] = useState<number>(0);
  useEffect(() => {
    const t = setInterval(() => setLeft(Math.max(0, (endsAt - Date.now()) / 1000)), 100);
    return () => clearInterval(t);
  }, [endsAt]);
  return <>{left.toFixed(1)}s</>;
}

export default function Jackpot() {
  const { user, refreshUser, notify } = useStore();
  const [snap, setSnap] = useState<JackpotSnapshot>({ roundId: '', state: 'open', hash: '', entries: [], pot: 0, history: [], endsAt: null, winner: null });
  const [amount, setAmount] = useState(100);

  useEffect(() => {
    return subscribe('jackpot', (f) => {
      if (f.type === 'state') {
        const data = f.data as JackpotSnapshot;
        setSnap((prev) => {
          if (data.winner && (!prev.winner || prev.winner.username !== data.winner.username)) {
            if (data.winner.username === user?.username) {
              notify(`🏆 You won the jackpot — ${data.winner.prize} credits!`, 'success');
            }
            refreshUser();
          }
          return data;
        });
      }
    });
  }, [user?.username]);

  const enter = async () => {
    try {
      await api.jackpotEnter(Number(amount));
      await refreshUser();
      notify(`Entered jackpot with ${amount} credits`, 'info');
    } catch (e) {
      notify((e as Error).message, 'error');
    }
  };

  // build a conic-gradient pie from entries
  let acc = 0;
  const stops = snap.entries.map((e, i) => {
    const start = (acc / (snap.pot || 1)) * 100;
    acc += e.amount;
    const end = (acc / (snap.pot || 1)) * 100;
    return `${SEGMENT_COLORS[i % SEGMENT_COLORS.length]} ${start}% ${end}%`;
  });
  const pie = stops.length ? `conic-gradient(${stops.join(', ')})` : 'conic-gradient(#242238 0% 100%)';

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-white">
          <Icon.Jackpot className="h-6 w-6 text-neon-gold" /> Jackpot
        </h1>

        <div className="panel flex flex-col items-center gap-4 p-8">
          <div className="relative grid h-56 w-56 place-items-center rounded-full" style={{ background: pie }}>
            <div className="grid h-40 w-40 place-items-center rounded-full bg-ink-900 text-center">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Total Pot</div>
                <div className="font-mono text-3xl font-black text-neon-gold">{Number(snap.pot).toLocaleString()}</div>
                <div className="mt-1 text-xs text-slate-400">
                  {snap.state === 'counting' && snap.endsAt && <>Drawing in <Countdown endsAt={snap.endsAt} /></>}
                  {snap.state === 'open' && 'Waiting for players'}
                  {snap.state === 'drawing' && 'Picking winner…'}
                </div>
              </div>
            </div>
          </div>

          {snap.winner && (
            <div className="rounded-xl border border-neon-gold/30 bg-neon-gold/10 px-4 py-2 text-center text-sm">
              🏆 <span className="font-bold text-neon-gold">{snap.winner.username}</span> won{' '}
              <span className="font-mono font-bold text-neon-gold">{snap.winner.prize}</span> ({snap.winner.chance}% chance)
            </div>
          )}
        </div>

        <div className="panel p-4">
          <div className="mb-2 text-sm font-bold text-white">Entries ({snap.entries.length})</div>
          <div className="space-y-2">
            {snap.entries.map((e, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg bg-ink-800 px-3 py-2 text-sm">
                <span className="h-3 w-3 rounded-full" style={{ background: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }} />
                <span className="flex-1 text-slate-300">{e.username}</span>
                <span className="font-mono text-slate-400">{e.amount}</span>
                <span className="w-12 text-right font-mono text-xs text-neon-violet">{e.chance}%</span>
              </div>
            ))}
            {!snap.entries.length && <p className="text-xs text-slate-500">No entries yet — start the pot!</p>}
          </div>
        </div>
      </div>

      <aside className="space-y-3">
        <div className="panel space-y-4 p-4">
          <label className="block text-xs text-slate-400">Entry amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(Number(e.target.value))}
            className="w-full rounded-xl border border-white/5 bg-ink-800 px-3 py-2.5 font-mono text-white outline-none focus:border-neon-gold/50"
          />
          <div className="flex gap-2">
            {[50, 100, 500].map((v) => (
              <button key={v} onClick={() => setAmount(v)} className="btn-ghost flex-1 py-2 text-xs">{v}</button>
            ))}
          </div>
          <button onClick={enter} className="btn-primary w-full py-3">Join Jackpot</button>
          <p className="text-center text-[11px] text-slate-500">5% house rake • provably fair winner draw</p>
        </div>

        <div className="panel p-4">
          <div className="mb-2 text-sm font-bold text-white">Recent winners</div>
          {snap.history.map((h, i) => (
            <div key={i} className="flex items-center justify-between py-1 text-xs">
              <span className="text-slate-300">{h.winner}</span>
              <span className="font-mono text-neon-gold">+{h.prize}</span>
            </div>
          ))}
          {!snap.history?.length && <p className="text-xs text-slate-500">No draws yet.</p>}
        </div>
      </aside>
    </div>
  );
}
