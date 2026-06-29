import type { SVGProps } from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { Icon } from './Icons';

interface Item {
  to: string;
  icon: (p: SVGProps<SVGSVGElement>) => JSX.Element;
  label: string;
  end?: boolean;
}

const ITEMS: Item[] = [
  { to: '/', icon: Icon.Home, label: 'Home', end: true },
  { to: '/sports', icon: Icon.Sports, label: 'Sports' },
  { to: '/casino', icon: Icon.Casino, label: 'Casino' },
  { to: '/crash', icon: Icon.Crash, label: 'Crash' },
  { to: '/bonus', icon: Icon.Gift, label: 'Rewards' },
];

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 z-40 flex w-full items-center justify-around border-t border-white/5 bg-ink-900/95 px-2 py-2 backdrop-blur lg:hidden">
      {ITEMS.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.end}
          className={({ isActive }) =>
            clsx('flex flex-col items-center gap-1 px-3 py-1 text-[10px] font-semibold', isActive ? 'text-neon-violet' : 'text-slate-500')
          }
        >
          <it.icon className="h-5 w-5" />
          {it.label}
        </NavLink>
      ))}
    </nav>
  );
}
