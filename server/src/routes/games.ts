import { Router, type Request, type Response } from 'express';
import { crashGame } from '../games/crash.js';
import { rouletteGame } from '../games/roulette.js';
import { jackpotGame } from '../games/jackpot.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';

const router = Router();

// REST fallbacks / actions for the realtime games. State streams over WS,
// but bets are placed via these authenticated endpoints.
router.get('/crash/state', (_req: Request, res: Response) => res.json(crashGame.snapshot()));
router.post('/crash/bet', requireAuth, (req: Request, res: Response) => {
  try {
    const { wager, autoCashout } = req.body || {};
    const user = (req as AuthedRequest).user;
    res.json(crashGame.placeBet(user.id, user.username, Number(wager), autoCashout ? Number(autoCashout) : null));
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});
router.post('/crash/cashout', requireAuth, (req: Request, res: Response) => {
  try {
    res.json(crashGame.cashout((req as AuthedRequest).user.id));
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

router.get('/roulette/state', (_req: Request, res: Response) => res.json(rouletteGame.snapshot()));
router.post('/roulette/bet', requireAuth, (req: Request, res: Response) => {
  try {
    const { color, amount } = req.body || {};
    const user = (req as AuthedRequest).user;
    res.json(rouletteGame.placeBet(user.id, user.username, color, Number(amount)));
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

router.get('/jackpot/state', (_req: Request, res: Response) => res.json(jackpotGame.snapshot()));
router.post('/jackpot/enter', requireAuth, (req: Request, res: Response) => {
  try {
    const { amount } = req.body || {};
    const user = (req as AuthedRequest).user;
    res.json(jackpotGame.enter(user.id, user.username, Number(amount)));
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

export default router;
