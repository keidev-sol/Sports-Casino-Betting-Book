import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from './store/useStore';

import Background from './components/Background';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import LiveTicker from './components/LiveTicker';
import MobileNav from './components/MobileNav';
import Toast from './components/Toast';

import Home from './pages/Home';
import Sports from './pages/Sports';
import Casino from './pages/Casino';
import Crash from './pages/Crash';
import Roulette from './pages/Roulette';
import Jackpot from './pages/Jackpot';
import Bonus from './pages/Bonus';
import Dice from './pages/Dice';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/sports" element={<Sports />} />
          <Route path="/casino" element={<Casino />} />
          <Route path="/casino/dice" element={<Dice />} />
          <Route path="/crash" element={<Crash />} />
          <Route path="/roulette" element={<Roulette />} />
          <Route path="/jackpot" element={<Jackpot />} />
          <Route path="/bonus" element={<Bonus />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const { init, loading } = useStore();

  useEffect(() => {
    init();
  }, []);

  return (
    <div className="min-h-screen">
      <Background />
      <Sidebar open />
      <div className="flex min-h-screen flex-col lg:pl-64">
        <TopBar />
        <main className="flex-1 px-4 pb-24 pt-5 lg:px-6">
          {loading ? (
            <div className="grid h-[60vh] place-items-center">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <div className="h-10 w-10 animate-spinSlow rounded-full border-2 border-neon-gold/30 border-t-neon-gold" />
                <span className="text-sm tracking-wide">Loading Crow…</span>
              </div>
            </div>
          ) : (
            <AnimatedRoutes />
          )}
        </main>
        <LiveTicker />
      </div>
      <MobileNav />
      <Toast />
    </div>
  );
}
