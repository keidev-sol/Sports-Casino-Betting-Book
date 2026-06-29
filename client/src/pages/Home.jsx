import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import EventCard from '../components/EventCard.jsx';
import { Icon } from '../components/Icons.jsx';

const FEATURES = [
  { to: '/crash', title: 'Crash', desc: 'Ride the curve, cash out before the bust.', icon: Icon.Crash, from: 'from-neon-purple/30', accent: 'text-neon-purple' },
  { to: '/roulette', title: 'X-Roulette', desc: 'Red, black or 14× green. Spins every 12s.', icon: Icon.Roulette, from: 'from-neon-green/25', accent: 'text-neon-green' },
  { to: '/jackpot', title: 'Jackpot', desc: 'Shared pot, winner takes (almost) all.', icon: Icon.Jackpot, from: 'from-neon-gold/25', accent: 'text-neon-gold' },
  { to: '/casino/dice', title: 'Dice', desc: 'Provably-fair instant roll. 99% RTP.', icon: Icon.Dice, from: 'from-neon-pink/25', accent: 'text-neon-pink' },
];

export default function Home() {
  const [feed, setFeed] = useState([]);
  const [quota, setQuota] = useState(null);

  useEffect(() => {
    api.featured().then((d) => {
      setFeed(d.feed || []);
      setQuota(d.quota);
    });
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-ink-800 via-ink-850 to-ink-900 p-6 md:p-10">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-neon-purple/20 blur-3xl" />
        <div className="absolute -bottom-24 right-32 h-60 w-60 rounded-full bg-neon-pink/15 blur-3xl" />
        <div className="relative max-w-xl">
          <div className="chip mb-4 bg-neon-green/10 text-neon-green">
            <Icon.Bolt className="h-3.5 w-3.5" /> Instant payouts • Provably fair
          </div>
          <h1 className="text-4xl font-extrabold leading-tight text-white md:text-5xl">
            Bet on <span className="text-gradient">everything.</span>
            <br /> Sports, Crash &amp; Casino.
          </h1>
          <p className="mt-4 max-w-md text-slate-400">
            Live odds from 40+ sports, original crypto games, and a shared jackpot — all in one
            lightning-fast platform.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/sports" className="btn-primary">Explore Sportsbook</Link>
            <Link to="/casino" className="btn-ghost">Enter Casino</Link>
          </div>
        </div>
      </section>

      {/* Game cards */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
          <Icon.Fire className="h-5 w-5 text-neon-pink" /> Crow Originals
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Link
              key={f.to}
              to={f.to}
              className={`group relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br ${f.from} to-ink-850 p-5 transition-transform hover:-translate-y-1`}
            >
              <f.icon className={`h-8 w-8 ${f.accent}`} />
              <div className="mt-4 text-lg font-bold text-white">{f.title}</div>
              <p className="mt-1 text-xs text-slate-400">{f.desc}</p>
              <Icon.Chevron className="absolute right-4 top-5 h-4 w-4 text-slate-600 transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>

      {/* Featured sports */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Icon.Sports className="h-5 w-5 text-neon-violet" /> Featured Matches
          </h2>
          <div className="flex items-center gap-2">
            {quota && (
              <span className="chip bg-ink-800 text-slate-400">
                {quota.mockMode ? 'MOCK DATA' : `${quota.remaining ?? '—'} API credits left`}
              </span>
            )}
            <Link to="/sports" className="text-sm font-semibold text-neon-violet hover:underline">
              View all →
            </Link>
          </div>
        </div>

        {feed.slice(0, 3).map((group) => (
          <div key={group.sportKey} className="mb-6">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
              {group.events[0]?.sport_title || group.sportKey}
            </h3>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {group.events.slice(0, 3).map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
