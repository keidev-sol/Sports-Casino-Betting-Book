import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { Icon } from './Icons.jsx';

const NAV = [
  { to: '/', label: 'Home', icon: Icon.Home, end: true },
  { to: '/sports', label: 'Sports', icon: Icon.Sports, badge: 'LIVE' },
  { to: '/casino', label: 'Casino', icon: Icon.Casino },
  { to: '/crash', label: 'Crash', icon: Icon.Crash, accent: 'text-neon-purple' },
  { to: '/roulette', label: 'X-Roulette', icon: Icon.Roulette, accent: 'text-neon-green' },
  { to: '/jackpot', label: 'Jackpot', icon: Icon.Jackpot, accent: 'text-neon-gold' },
  { to: '/bonus', label: 'Rewards', icon: Icon.Gift, accent: 'text-neon-pink' },
];

export default function Sidebar({ open }) {
  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 z-40 hidden h-full w-64 flex-col border-r border-white/5 bg-ink-900/95 px-3 pb-6 pt-4 backdrop-blur lg:flex',
        open ? 'lg:flex' : ''
      )}
    >
      <NavLink to="/" className="mb-6 flex items-center gap-2 px-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-neon-purple to-neon-pink font-black text-white shadow-glow">
          C
        </div>
        <div className="text-xl font-extrabold tracking-tight">
          Cr<span className="text-gradient">ow</span>
        </div>
      </NavLink>

      <nav className="flex flex-col gap-1">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) => clsx('nav-item', isActive && 'nav-item-active')}
          >
            <n.icon className={clsx('h-5 w-5', n.accent)} />
            <span className="flex-1">{n.label}</span>
            {n.badge && (
              <span className="chip animate-pulseGlow bg-neon-red/15 text-[10px] text-neon-red">
                {n.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 panel p-4">
        <div className="mb-1 flex items-center gap-2 text-sm font-bold text-white">
          <Icon.Shield className="h-4 w-4 text-neon-green" /> Provably Fair
        </div>
        <p className="text-xs leading-relaxed text-slate-400">
          Every Crash, Roulette &amp; Jackpot round is verifiable with SHA-256 seed commitments.
        </p>
      </div>

      <div className="mt-auto px-2 pt-6 text-[11px] leading-relaxed text-slate-600">
        <p>Crow is a portfolio demo. No real money is involved. 18+ • Play responsibly.</p>
      </div>
    </aside>
  );
}
