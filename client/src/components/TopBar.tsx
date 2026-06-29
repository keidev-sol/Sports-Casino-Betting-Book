import { useStore } from '../store/useStore';
import { Icon } from './Icons';
import AnimatedNumber from './AnimatedNumber';

export default function TopBar() {
  const { user, notify } = useStore();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/5 bg-ink-950/70 px-4 backdrop-blur-xl lg:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-neon-gold to-neon-pink font-black text-ink-950 shadow-glow">C</div>
        <span className="font-extrabold">Cr<span className="text-gradient">ow</span></span>
      </div>

      <div className="relative hidden flex-1 max-w-md md:block">
        <Icon.Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          placeholder="Search games, teams, markets…"
          className="w-full rounded-xl border border-white/5 bg-ink-800/80 py-2.5 pl-10 pr-4 text-sm text-slate-200 outline-none transition-colors placeholder:text-slate-500 focus:border-neon-gold/50 focus:bg-ink-800"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-ink-800/80 px-3 py-2 transition-colors hover:border-neon-gold/30">
          <div className="grid h-7 w-7 place-items-center rounded-full bg-neon-gold/15 text-neon-gold">
            <Icon.Wallet className="h-4 w-4" />
          </div>
          <div className="leading-none">
            <AnimatedNumber value={user?.balance ?? 0} className="block font-mono text-sm font-bold text-white" />
            <div className="text-[10px] uppercase tracking-wide text-slate-500">credits</div>
          </div>
        </div>
        <button className="btn-green hidden sm:inline-flex" onClick={() => notify('Demo wallet — deposits are simulated 💸', 'success')}>
          <Icon.Plus className="h-4 w-4" /> Deposit
        </button>
        <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-ink-800/80 py-1.5 pl-1.5 pr-3">
          <div className="relative grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-neon-cyan to-neon-gold text-sm font-bold text-ink-950">
            {(user?.username || 'G')[0].toUpperCase()}
          </div>
          <div className="hidden leading-none sm:block">
            <div className="text-sm font-semibold text-white">{user?.username || 'guest'}</div>
            <div className="text-[10px] font-semibold text-neon-gold">Lvl {user?.level ?? 1}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
