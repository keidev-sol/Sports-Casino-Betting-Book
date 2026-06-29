import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import EventCard from '../components/EventCard';
import { Icon } from '../components/Icons';
import type { FeaturedGroup, Quota } from '@shared/types';

interface Feature {
  to: string;
  title: string;
  desc: string;
  icon: (p: import('react').SVGProps<SVGSVGElement>) => JSX.Element;
  accent: string;
}

const FEATURES: Feature[] = [
  { to: '/crash', title: 'Crash', desc: 'Ride the curve, cash out before the bust.', icon: Icon.Crash, accent: '#e8b923' },
  { to: '/roulette', title: 'X-Roulette', desc: 'Red, black or 14× green. Spins every 12s.', icon: Icon.Roulette, accent: '#19c964' },
  { to: '/jackpot', title: 'Jackpot', desc: 'Shared pot, winner takes (almost) all.', icon: Icon.Jackpot, accent: '#ffc233' },
  { to: '/casino/dice', title: 'Dice', desc: 'Provably-fair instant roll. 99% RTP.', icon: Icon.Dice, accent: '#f0a52e' },
];

const STATS = [
  { label: 'Live Sports', value: '40+' },
  { label: 'Originals RTP', value: '99%' },
  { label: 'Settlement', value: '<1s' },
  { label: 'Provably Fair', value: '100%' },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function Home() {
  const [feed, setFeed] = useState<FeaturedGroup[]>([]);
  const [quota, setQuota] = useState<Quota | null>(null);

  useEffect(() => {
    api.featured().then((d) => {
      setFeed(d.feed || []);
      setQuota(d.quota);
    });
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* ===== Hero — main stadium banner ===== */}
      <section className="relative overflow-hidden rounded-3xl border border-neon-gold/25 shadow-glow-gold">
        <img
          src="/hero-banner.jpg"
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            if (!img.src.endsWith('.svg')) img.src = '/hero-banner.svg';
          }}
          alt="Sports Casino 2026 — Live Soccer • Premium Betting"
          className="h-[300px] w-full animate-kenburns object-cover sm:h-[380px] md:h-[460px]"
        />
        {/* layered scrims for legibility */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/35 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink-950/85 via-ink-950/10 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-5 sm:p-7 md:flex-row md:items-end md:justify-between md:p-9"
        >
          <div>
            <div className="chip mb-3 w-max gap-2 bg-neon-gold/15 text-neon-gold ring-1 ring-neon-gold/30">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-gold opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-gold" />
              </span>
              Live Soccer • Premium Betting • Provably Fair
            </div>
            <h1 className="text-3xl font-black leading-[1.05] tracking-tight text-white drop-shadow-lg sm:text-4xl md:text-5xl">
              The <span className="text-gradient">2026</span> Sportsbook
              <br className="hidden sm:block" /> &amp; Crypto Casino
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/sports" className="btn-primary px-5 py-3 text-base">Explore Sportsbook</Link>
            <Link to="/casino" className="btn glass px-5 py-3 text-base text-white hover:bg-white/10">
              Enter Casino
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ===== Stats strip ===== */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {STATS.map((s) => (
          <motion.div key={s.label} variants={item} className="glass rounded-2xl px-4 py-4 text-center">
            <div className="text-2xl font-black text-gradient">{s.value}</div>
            <div className="mt-0.5 text-[11px] uppercase tracking-wider text-slate-400">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ===== Originals ===== */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
          <Icon.Fire className="h-5 w-5 text-neon-gold" /> Crow Originals
        </h2>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-2 gap-4 lg:grid-cols-4"
        >
          {FEATURES.map((f) => (
            <motion.div key={f.to} variants={item}>
              <Link
                to={f.to}
                className="group relative block overflow-hidden rounded-2xl border border-white/5 bg-ink-850 p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-white/10 hover:shadow-glow-gold"
              >
                {/* accent wash */}
                <div
                  className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-40"
                  style={{ background: f.accent }}
                />
                <div
                  className="grid h-12 w-12 place-items-center rounded-xl ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${f.accent}22`, color: f.accent }}
                >
                  <f.icon className="h-6 w-6" />
                </div>
                <div className="mt-4 text-lg font-bold text-white">{f.title}</div>
                <p className="mt-1 text-xs text-slate-400">{f.desc}</p>
                <Icon.Chevron className="absolute right-4 top-5 h-4 w-4 text-slate-600 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== Featured sports ===== */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Icon.Sports className="h-5 w-5 text-neon-gold" /> Featured Matches
          </h2>
          <div className="flex items-center gap-2">
            {quota && (
              <span className="chip bg-ink-800 text-slate-400">
                {quota.mockMode ? 'MOCK DATA' : `${quota.remaining ?? '—'} API credits left`}
              </span>
            )}
            <Link to="/sports" className="text-sm font-semibold text-neon-gold hover:underline">
              View all →
            </Link>
          </div>
        </div>

        {feed.slice(0, 3).map((group) => (
          <div key={group.sportKey} className="mb-6">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
              {group.events[0]?.sport_title || group.sportKey}
            </h3>
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
            >
              {group.events.slice(0, 3).map((e) => (
                <motion.div key={e.id} variants={item}>
                  <EventCard event={e} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        ))}
      </section>
    </div>
  );
}
