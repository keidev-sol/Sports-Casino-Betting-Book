import { create } from 'zustand';
import { api, setToken, getToken } from '../lib/api.js';

export const useStore = create((set, get) => ({
  user: null,
  loading: true,
  betSlip: [], // [{ id, eventId, label, price, market }]
  toast: null,

  async init() {
    try {
      if (getToken()) {
        const { user } = await api.me();
        set({ user, loading: false });
        return;
      }
    } catch {
      setToken(null);
    }
    // Auto guest-login for the demo.
    const { token, user } = await api.guest();
    setToken(token);
    set({ user, loading: false });
  },

  setUser: (user) => set({ user }),

  refreshUser: async () => {
    try {
      const { user } = await api.me();
      set({ user });
    } catch {
      /* ignore */
    }
  },

  notify: (message, kind = 'info') => {
    set({ toast: { message, kind, id: Math.random() } });
    setTimeout(() => set((s) => (s.toast && Date.now() ? { toast: null } : s)), 3200);
  },

  // Bet slip management
  addLeg: (leg) => {
    const slip = get().betSlip;
    // one selection per event
    const filtered = slip.filter((l) => l.eventId !== leg.eventId || l.market !== leg.market);
    const exists = slip.find((l) => l.id === leg.id);
    set({ betSlip: exists ? filtered.filter((l) => l.id !== leg.id) : [...filtered, leg] });
  },
  removeLeg: (id) => set({ betSlip: get().betSlip.filter((l) => l.id !== id) }),
  clearSlip: () => set({ betSlip: [] }),
}));
