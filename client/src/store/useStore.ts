import { create } from 'zustand';
import { api, setToken, getToken } from '../lib/api';
import type { User } from '@shared/types';

export interface SlipLeg {
  id: string;
  eventId: string;
  event?: string;
  label: string;
  price: number;
  market: string;
}

export type ToastKind = 'info' | 'success' | 'error';

export interface Toast {
  message: string;
  kind: ToastKind;
  id: number;
}

interface StoreState {
  user: User | null;
  loading: boolean;
  betSlip: SlipLeg[];
  toast: Toast | null;
  init: () => Promise<void>;
  setUser: (user: User) => void;
  refreshUser: () => Promise<void>;
  notify: (message: string, kind?: ToastKind) => void;
  addLeg: (leg: SlipLeg) => void;
  removeLeg: (id: string) => void;
  clearSlip: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  user: null,
  loading: true,
  betSlip: [],
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
    setTimeout(() => set({ toast: null }), 3200);
  },

  // Bet slip management
  addLeg: (leg) => {
    const slip = get().betSlip;
    // one selection per event + market
    const filtered = slip.filter((l) => l.eventId !== leg.eventId || l.market !== leg.market);
    const exists = slip.find((l) => l.id === leg.id);
    set({ betSlip: exists ? filtered.filter((l) => l.id !== leg.id) : [...filtered, leg] });
  },
  removeLeg: (id) => set({ betSlip: get().betSlip.filter((l) => l.id !== id) }),
  clearSlip: () => set({ betSlip: [] }),
}));
