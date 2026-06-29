import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { api } from '../lib/api';
import { Icon } from './Icons';

export default function BetSlip() {
  const { betSlip, removeLeg, clearSlip, refreshUser, notify } = useStore();
  const [stake, setStake] = useState(50);
  const [open, setOpen] = useState(true);
  const [placing, setPlacing] = useState(false);

  const combined = betSlip.reduce((acc, l) => acc * Number(l.price), 1);
  const potential = (stake * combined).toFixed(2);

  async function place() {
    if (!betSlip.length || stake <= 0) return;
    setPlacing(true);
    try {
      await api.placeBet(
        betSlip.map((l) => ({ eventId: l.eventId, label: l.label, price: l.price, market: l.market })),
        Number(stake)
      );
      await refreshUser();
      notify(`Bet placed — ${betSlip.length} leg(s) for ${stake} credits 🎟️`, 'success');
      clearSlip();
    } catch (e) {
      notify((e as Error).message, 'error');
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="panel sticky top-20 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <span className="flex items-center gap-2 font-bold text-white">
          <Icon.Bolt className="h-4 w-4 text-neon-gold" /> Bet Slip
          {betSlip.length > 0 && (
            <span className="grid h-5 w-5 place-items-center rounded-full bg-neon-purple text-[11px] text-white">
              {betSlip.length}
            </span>
          )}
        </span>
        <Icon.Chevron className={`h-4 w-4 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="space-y-2 px-4 pb-4">
              {betSlip.length === 0 && (
                <p className="py-6 text-center text-sm text-slate-500">
                  Tap any odds to add a selection.
                </p>
              )}

              {betSlip.map((l) => (
                <div key={l.id} className="rounded-xl border border-white/5 bg-ink-800 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-white">{l.label}</div>
                      <div className="text-xs text-slate-500">{l.event} • {l.market}</div>
                    </div>
                    <button onClick={() => removeLeg(l.id)} className="text-slate-500 hover:text-neon-red">✕</button>
                  </div>
                  <div className="mt-1 font-mono text-sm font-bold text-neon-green">{Number(l.price).toFixed(2)}</div>
                </div>
              ))}

              {betSlip.length > 0 && (
                <>
                  {betSlip.length > 1 && (
                    <div className="flex items-center justify-between rounded-lg bg-ink-800 px-3 py-2 text-xs">
                      <span className="text-slate-400">{betSlip.length}-leg parlay odds</span>
                      <span className="font-mono font-bold text-neon-violet">{combined.toFixed(2)}×</span>
                    </div>
                  )}
                  <label className="block text-xs text-slate-400">Stake</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={stake}
                      min={1}
                      onChange={(e) => setStake(Number(e.target.value))}
                      className="w-full rounded-xl border border-white/5 bg-ink-800 px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-neon-purple/50"
                    />
                    {[10, 50, 100].map((v) => (
                      <button key={v} onClick={() => setStake(v)} className="btn-ghost px-3 py-2.5 text-xs">
                        {v}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-ink-800 px-3 py-2.5">
                    <span className="text-sm text-slate-400">Potential return</span>
                    <span className="font-mono text-lg font-bold text-neon-green">{potential}</span>
                  </div>

                  <button disabled={placing} onClick={place} className="btn-primary w-full">
                    {placing ? 'Placing…' : 'Place Bet'}
                  </button>
                  <button onClick={clearSlip} className="w-full text-center text-xs text-slate-500 hover:text-slate-300">
                    Clear slip
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
