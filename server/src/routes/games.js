import { Router } from 'express';
import { crashGame } from '../games/crash.js';
import { rouletteGame } from '../games/roulette.js';
import { jackpotGame } from '../games/jackpot.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// REST fallbacks / actions for the realtime games. State streams over WS,
// but bets are placed via these authenticated endpoints.
router.get('/crash/state', (_req, res) => res.json(crashGame.snapshot()));
router.post('/crash/bet', requireAuth, (req, res) => {
  try {
    const { wager, autoCashout } = req.body || {};
    res.json(crashGame.placeBet(req.user.id, req.user.username, Number(wager), autoCashout ? Number(autoCashout) : null));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
router.post('/crash/cashout', requireAuth, (req, res) => {
  try {
    res.json(crashGame.cashout(req.user.id));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/roulette/state', (_req, res) => res.json(rouletteGame.snapshot()));
router.post('/roulette/bet', requireAuth, (req, res) => {
  try {
    const { color, amount } = req.body || {};
    res.json(rouletteGame.placeBet(req.user.id, req.user.username, color, Number(amount)));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/jackpot/state', (_req, res) => res.json(jackpotGame.snapshot()));
router.post('/jackpot/enter', requireAuth, (req, res) => {
  try {
    const { amount } = req.body || {};
    res.json(jackpotGame.enter(req.user.id, req.user.username, Number(amount)));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
