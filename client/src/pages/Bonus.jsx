import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { useStore } from '../store/useStore.js';
import { Icon } from '../components/Icons.jsx';

const ICONS = { welcome: Icon.Gift, rakeback: Icon.Bolt, daily: Icon.Star, weekly: Icon.Wallet, leaderboard: Icon.Trophy };

export default function Bonus() {
  const { user, refreshUser, notify } = useStore();
  const [bonuses, setBonuses] = useState([]);

  const load = () => api.bonuses().then((d) => setBonuses(d.bonuses || []));
  useEffect(() => {
    load();
  }, []);

  const claim = async (b) => {
    try {
      const r = await api.claimBonus(b.id);
      await refreshUser();
      await load();
      notify(`Claimed ${b.title} → +${r.reward} credits 🎁`, 'success');
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  const xpToNext = ((user?.xp || 0) % 1000) / 10;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-r from-neon-pink/20 via-ink-850 to-neon-gold/15 p-8">
        <h1 className="text-3xl font-extrabold text-white">Rewards &amp; Bonuses</h1>
        <p className="mt-2 max-w-md text-slate-400">Level up as you play. Claim instant rakeback, daily spins and weekly cashback.</p>

        <div className="mt-5 max-w-md">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-semibold text-white">Level {user?.level ?? 1}</span>
            <span className="text-slate-400">{Math.floor(xpToNext)}% to Lvl {(user?.level ?? 1) + 1}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-ink-800">
            <div className="h-full rounded-full bg-gradient-to-r from-neon-purple to-neon-pink" style={{ width: `${xpToNext}%` }} />
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bonuses.map((b) => {
          const I = ICONS[b.id] || Icon.Gift;
          return (
            <div key={b.id} className="panel flex flex-col p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-ink-800 text-neon-violet">
                  <I className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-bold text-white">{b.title}</div>
                  {b.reward > 0 && <div className="text-xs text-neon-green">up to +{b.reward.toLocaleString()}</div>}
                  {b.id === 'rakeback' && <div className="text-xs text-neon-gold">{b.rakebackBalance?.toFixed(2)} ready</div>}
                </div>
              </div>
              <p className="flex-1 text-sm text-slate-400">{b.desc}</p>
              <button
                onClick={() => claim(b)}
                disabled={!b.available && b.id !== 'rakeback'}
                className="btn-primary mt-4 w-full"
              >
                {b.claimed && b.id !== 'rakeback' ? 'Claimed ✓' : b.cta}
              </button>
            </div>
          );
        })}
      </div>

      <div className="panel p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
          <Icon.Trophy className="h-5 w-5 text-neon-gold" /> Wager Race — Top Players
        </h2>
        <div className="space-y-2">
          {[
            { n: 'cryptoKing', w: 184200 },
            { n: 'moonshot', w: 142800 },
            { n: 'degenDan', w: 98700 },
            { n: user?.username || 'you', w: Math.floor(user?.xp || 0) },
            { n: 'luckyLuke', w: 41200 },
          ]
            .sort((a, b) => b.w - a.w)
            .map((p, i) => (
              <div key={p.n} className="flex items-center gap-3 rounded-xl bg-ink-800 px-4 py-3">
                <span className={`w-6 font-bold ${i === 0 ? 'text-neon-gold' : 'text-slate-500'}`}>#{i + 1}</span>
                <span className="flex-1 font-semibold text-white">{p.n}</span>
                <span className="font-mono text-sm text-neon-green">{p.w.toLocaleString()} wagered</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
