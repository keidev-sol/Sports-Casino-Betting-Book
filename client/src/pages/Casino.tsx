import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { api } from '../lib/api';
import { useStore } from '../store/useStore';
import { Icon } from '../components/Icons';
import type { CasinoGame, CasinoCategory } from '@shared/types';

function GameTile({ game, onPlay }: { game: CasinoGame; onPlay: (g: CasinoGame) => void }) {
  return (
    <button
      onClick={() => onPlay(game)}
      className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/5 text-left transition-all duration-300 hover:-translate-y-1.5 hover:border-white/15"
      style={{ background: `linear-gradient(160deg, ${game.accent}33, #0e1830 70%)` }}
    >
      {/* hover glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: `inset 0 0 60px -20px ${game.accent}` }}
      />
      <div className="absolute right-2 top-2 chip z-10 bg-black/40 text-[10px] text-white ring-1 ring-white/10">{game.tag || `${game.rtp}% RTP`}</div>
      <div className="flex h-full flex-col items-center justify-center gap-3 p-4">
        <div
          className="grid h-16 w-16 place-items-center rounded-2xl text-2xl font-black text-ink-950 shadow-glow transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
          style={{ background: game.accent }}
        >
          {game.name[0]}
        </div>
        <div className="text-center">
          <div className="font-bold text-white">{game.name}</div>
          <div className="text-[11px] text-slate-400">{game.provider}</div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 translate-y-full bg-black/60 p-3 text-center text-sm font-bold text-neon-gold backdrop-blur transition-transform duration-300 group-hover:translate-y-0">
        ▶ Play now
      </div>
    </button>
  );
}

export default function Casino() {
  const [games, setGames] = useState<CasinoGame[]>([]);
  const [categories, setCategories] = useState<CasinoCategory[]>([]);
  const [cat, setCat] = useState<string>('all');
  const navigate = useNavigate();
  const { notify } = useStore();

  useEffect(() => {
    api.casinoGames().then((d) => {
      setGames(d.games || []);
      setCategories(d.categories || []);
    });
  }, []);

  const onPlay = (g: CasinoGame) => {
    if (g.route) navigate(g.route);
    else notify(`${g.name} is a showcase tile in this demo 🎰`, 'info');
  };

  const filtered = cat === 'all' ? games : games.filter((g) => g.category === cat);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-r from-neon-purple/20 via-ink-850 to-neon-pink/15 p-8">
        <h1 className="text-3xl font-extrabold text-white">Casino</h1>
        <p className="mt-2 max-w-md text-slate-400">
          Originals built in-house plus 3,000+ slots and live tables from top providers.
        </p>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {[{ id: 'all', label: 'All Games' }, ...categories].map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={clsx('chip shrink-0 px-4 py-2', cat === c.id ? 'bg-neon-purple text-white' : 'bg-ink-800 text-slate-400 hover:text-white')}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
        {filtered.map((g) => (
          <GameTile key={g.id} game={g} onPlay={onPlay} />
        ))}
      </div>

      <div className="panel flex items-center gap-3 p-4 text-sm text-slate-400">
        <Icon.Shield className="h-5 w-5 shrink-0 text-neon-green" />
        All Crow Originals are provably fair — verify any round with its server seed after reveal.
      </div>
    </div>
  );
}
