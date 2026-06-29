import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useStore } from './store/useStore.js';

import Sidebar from './components/Sidebar.jsx';
import TopBar from './components/TopBar.jsx';
import LiveTicker from './components/LiveTicker.jsx';
import MobileNav from './components/MobileNav.jsx';
import Toast from './components/Toast.jsx';

import Home from './pages/Home.jsx';
import Sports from './pages/Sports.jsx';
import Casino from './pages/Casino.jsx';
import Crash from './pages/Crash.jsx';
import Roulette from './pages/Roulette.jsx';
import Jackpot from './pages/Jackpot.jsx';
import Bonus from './pages/Bonus.jsx';
import Dice from './pages/Dice.jsx';

export default function App() {
  const { init, loading } = useStore();

  useEffect(() => {
    init();
  }, []);

  return (
    <div className="min-h-screen">
      <Sidebar open />
      <div className="flex min-h-screen flex-col lg:pl-64">
        <TopBar />
        <main className="flex-1 px-4 pb-24 pt-5 lg:px-6">
          {loading ? (
            <div className="grid h-[60vh] place-items-center text-slate-500">Loading Crow…</div>
          ) : (
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sports" element={<Sports />} />
              <Route path="/casino" element={<Casino />} />
              <Route path="/casino/dice" element={<Dice />} />
              <Route path="/crash" element={<Crash />} />
              <Route path="/roulette" element={<Roulette />} />
              <Route path="/jackpot" element={<Jackpot />} />
              <Route path="/bonus" element={<Bonus />} />
            </Routes>
          )}
        </main>
        <LiveTicker />
      </div>
      <MobileNav />
      <Toast />
    </div>
  );
}
