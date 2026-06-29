import { Router, type Request, type Response } from 'express';
import { CASINO_GAMES, CASINO_CATEGORIES } from '../services/casinoCatalog.js';
import { rollDice } from '../games/dice.js';
import { recentActivity } from '../services/store.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';

const router = Router();

router.get('/games', (_req: Request, res: Response) => {
  res.json({ games: CASINO_GAMES, categories: CASINO_CATEGORIES });
});

router.get('/activity', (_req: Request, res: Response) => {
  res.json({ activity: recentActivity() });
});

router.post('/dice', requireAuth, (req: Request, res: Response) => {
  try {
    const { wager, target, direction } = req.body || {};
    const user = (req as AuthedRequest).user;
    const result = rollDice({
      userId: user.id,
      username: user.username,
      wager: Number(wager),
      target: Number(target),
      direction,
    });
    res.json({ result });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

export default router;
