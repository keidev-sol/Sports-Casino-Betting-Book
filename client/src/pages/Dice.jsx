import { useState } from 'react';
import clsx from 'clsx';
import { api } from '../lib/api.js';
import { useStore } from '../store/useStore.js';
import { Icon } from '../components/Icons.jsx';

export default function Dice() {
  const { user, refreshUser, notify } = useStore();
  const [wager, setWager] = useState(50);
  const [target, setTarget] = useState(50);
  const [direction, setDirection] = useState('over');
  const [last, setLast] = useState(null);
  const [rolling, setRolling] = useState(false);

  const winChance = direction === 'over' ? 100 - target : target;
  const multiplier = (99 / winChance).toFixed(4);

  const roll = async () => {
    setRolling(true);
    try {
      const { result } = await api.dice(Number(wager), Number(target), direction);
      setLast(result);
      await refreshUser();
      notify(result.won ? `Win! ${result.roll} → +${result.payout} 🎲` : `Bust at ${result.roll}`, result.won ? 'success' : 'error');
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setRolling(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-5">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-white">
          <Icon.Dice className="h-6 w-6 text-neon-pink" /> Dice
        </h1>

        <div className="panel p-8">
          <div className="mb-4 text-center">
            <div className={clsx('font-mono text-6xl font-black', last ? (last.won ? 'text-neon-green' : 'text-neon-red') : 'text-white')}>
              {last ? last.roll.toFixed(2) : '—'}
            </div>
            <div className="text-sm text-slate-400">{last ? (last.won ? 'WIN' : 'LOSE') : 'Roll to play'}</div>
          </div>

          {/* slider track */}
          <div className="relative mt-8 h-3 rounded-full bg-gradient-to-r from-neon-red via-neon-gold to-neon-green">
            <div
              className="absolute -top-1 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-white bg-ink-900"
              style={{ left: `${target}%` }}
            />
            {last && (
              <div
                className="absolute -bottom-7 -translate-x-1/2 font-mono text-xs text-white"
                style={{ left: `${last.roll}%` }}
              >
                ▲ {last.roll.toFixed(0)}
              </div>
            )}
          </div>
          <input
            type="range"
            min="2"
            max="98"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            className="mt-3 w-full accent-neon-purple"
          />

          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-ink-800 p-3">
              <div className="text-xs text-slate-500">Multiplier</div>
              <div className="font-mono font-bold text-neon-violet">{multiplier}×</div>
            </div>
            <div className="rounded-xl bg-ink-800 p-3">
              <div className="text-xs text-slate-500">Roll {direction}</div>
              <div className="font-mono font-bold text-white">{target}</div>
            </div>
            <div className="rounded-xl bg-ink-800 p-3">
              <div className="text-xs text-slate-500">Win chance</div>
              <div className="font-mono font-bold text-neon-green">{winChance}%</div>
            </div>
          </div>
        </div>
      </div>

      <aside className="space-y-3">
        <div className="panel space-y-4 p-4">
          <div>
            <label className="mb-1 block text-xs text-slate-400">Bet amount</label>
            <input
              type="number"
              value={wager}
              onChange={(e) => setWager(Number(e.target.value))}
              className="w-full rounded-xl border border-white/5 bg-ink-800 px-3 py-2.5 font-mono text-white outline-none focus:border-neon-pink/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setDirection('under')} className={clsx('btn py-2.5', direction === 'under' ? 'bg-neon-purple text-white' : 'btn-ghost')}>
              Roll Under
            </button>
            <button onClick={() => setDirection('over')} className={clsx('btn py-2.5', direction === 'over' ? 'bg-neon-purple text-white' : 'btn-ghost')}>
              Roll Over
            </button>
          </div>
          <button disabled={rolling} onClick={roll} className="btn-primary w-full py-3.5 text-base">
            {rolling ? 'Rolling…' : 'Roll Dice'}
          </button>
          <div className="flex items-center justify-between rounded-xl bg-ink-800 px-3 py-2 text-sm">
            <span className="text-slate-400">Balance</span>
            <span className="font-mono font-bold text-neon-green">{Number(user?.balance || 0).toFixed(2)}</span>
          </div>
        </div>
        {last && (
          <div className="panel p-4 text-xs text-slate-400">
            <div className="mb-1 font-bold text-white">Provably fair</div>
            <div className="break-all">hash: <span className="font-mono text-slate-500">{last.hash.slice(0, 32)}…</span></div>
            <div className="break-all">seed: <span className="font-mono text-slate-500">{last.serverSeed.slice(0, 32)}…</span></div>
          </div>
        )}
      </aside>
    </div>
  );
}
