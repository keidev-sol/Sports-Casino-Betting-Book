import { useStore } from '../store/useStore.js';
import { Icon } from './Icons.jsx';

function fmt(n) {
  return Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function TopBar() {
  const { user, notify } = useStore();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/5 bg-ink-900/80 px-4 backdrop-blur-md lg:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-neon-purple to-neon-pink font-black text-white">C</div>
        <span className="font-extrabold">Cr<span className="text-gradient">ow</span></span>
      </div>

      <div className="relative hidden flex-1 max-w-md md:block">
        <Icon.Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          placeholder="Search games, teams, markets…"
          className="w-full rounded-xl border border-white/5 bg-ink-800 py-2.5 pl-10 pr-4 text-sm text-slate-200 outline-none placeholder:text-slate-500 focus:border-neon-purple/50"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-ink-800 px-3 py-2">
          <Icon.Wallet className="h-5 w-5 text-neon-green" />
          <div className="leading-none">
            <div className="font-mono text-sm font-bold text-white">{fmt(user?.balance)}</div>
            <div className="text-[10px] uppercase tracking-wide text-slate-500">credits</div>
          </div>
        </div>
        <button className="btn-green hidden sm:inline-flex" onClick={() => notify('Demo wallet — deposits are simulated 💸', 'success')}>
          <Icon.Plus className="h-4 w-4" /> Deposit
        </button>
        <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-ink-800 py-1.5 pl-1.5 pr-3">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple text-sm font-bold text-white">
            {(user?.username || 'G')[0].toUpperCase()}
          </div>
          <div className="hidden leading-none sm:block">
            <div className="text-sm font-semibold text-white">{user?.username || 'guest'}</div>
            <div className="text-[10px] text-neon-gold">Lvl {user?.level ?? 1}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
