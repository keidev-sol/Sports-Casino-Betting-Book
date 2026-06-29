import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { useStore } from '../store/useStore.js';

export default function Toast() {
  const toast = useStore((s) => s.toast);
  return (
    <div className="pointer-events-none fixed bottom-20 left-1/2 z-50 -translate-x-1/2">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0 }}
            className={clsx(
              'rounded-xl border px-5 py-3 text-sm font-semibold shadow-card backdrop-blur',
              toast.kind === 'success' && 'border-neon-green/30 bg-neon-green/10 text-neon-lime',
              toast.kind === 'error' && 'border-neon-red/30 bg-neon-red/10 text-neon-red',
              toast.kind === 'info' && 'border-neon-purple/30 bg-neon-purple/10 text-neon-violet'
            )}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
