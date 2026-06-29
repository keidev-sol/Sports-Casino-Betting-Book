import { Router } from 'express';
import { CASINO_GAMES, CASINO_CATEGORIES } from '../services/casinoCatalog.js';
import { rollDice } from '../games/dice.js';
import { recentActivity } from '../services/store.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/games', (_req, res) => {
  res.json({ games: CASINO_GAMES, categories: CASINO_CATEGORIES });
});

router.get('/activity', (_req, res) => {
  res.json({ activity: recentActivity() });
});

router.post('/dice', requireAuth, (req, res) => {
  try {
    const { wager, target, direction } = req.body || {};
    const result = rollDice({
      userId: req.user.id,
      username: req.user.username,
      wager: Number(wager),
      target: Number(target),
      direction,
    });
    res.json({ result });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
