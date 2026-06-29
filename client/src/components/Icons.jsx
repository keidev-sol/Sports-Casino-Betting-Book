// Lightweight inline icon set (stroke-based, currentColor).
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

export const Icon = {
  Home: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></svg>),
  Sports: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 3a14 14 0 0 0 0 18M12 3a14 14 0 0 1 0 18M3 12h18" /></svg>),
  Casino: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8" cy="8" r="1.3" fill="currentColor" /><circle cx="16" cy="16" r="1.3" fill="currentColor" /><circle cx="12" cy="12" r="1.3" fill="currentColor" /></svg>),
  Crash: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M3 20L9 12l4 4 7-10" /><path d="M16 6h4v4" /></svg>),
  Roulette: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /></svg>),
  Jackpot: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 19l-4.8 2.5.9-5.4L4.2 8.7l5.4-.8z" /></svg>),
  Gift: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M3 12h18M12 8v13M12 8S10 3 7.5 4.5 9 8 12 8zM12 8s2-5 4.5-3.5S15 8 12 8z" /></svg>),
  Dice: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><rect x="4" y="4" width="16" height="16" rx="4" /><circle cx="9" cy="9" r="1.2" fill="currentColor" /><circle cx="15" cy="15" r="1.2" fill="currentColor" /><circle cx="15" cy="9" r="1.2" fill="currentColor" /><circle cx="9" cy="15" r="1.2" fill="currentColor" /></svg>),
  Wallet: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><rect x="3" y="6" width="18" height="13" rx="3" /><path d="M16 12h4v3h-4a1.5 1.5 0 0 1 0-3z" /></svg>),
  Bolt: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M13 2L4 14h7l-1 8 9-12h-7z" /></svg>),
  Search: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>),
  Fire: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M12 3c1 3-2 4-2 7a2 2 0 1 0 4 0c0-1 0-1 1-2 2 2 3 4 3 6a6 6 0 1 1-12 0c0-4 4-6 6-11z" /></svg>),
  Trophy: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M6 4h12v4a6 6 0 0 1-12 0z" /><path d="M6 6H3v2a3 3 0 0 0 3 3M18 6h3v2a3 3 0 0 1-3 3M9 18h6M10 14v4M14 14v4" /></svg>),
  Live: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" /><path d="M6 6a8 8 0 0 0 0 12M18 6a8 8 0 0 1 0 12" /></svg>),
  Chevron: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M9 6l6 6-6 6" /></svg>),
  Star: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.2l1-5.8L3.5 9.2l5.9-.9z" /></svg>),
  Plus: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>),
  Shield: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M9 12l2 2 4-4" /></svg>),
};
